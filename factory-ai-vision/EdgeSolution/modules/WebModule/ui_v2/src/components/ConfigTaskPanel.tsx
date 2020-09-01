import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import * as R from 'ramda';
import {
  Panel,
  Stack,
  PrimaryButton,
  DefaultButton,
  Dropdown,
  Text,
  TextField,
  Toggle,
} from '@fluentui/react';
import { useSelector, useDispatch } from 'react-redux';
import Axios from 'axios';

import { cameraOptionsSelector, getCameras } from '../store/cameraSlice';
import { partOptionsSelector, getParts } from '../store/partSlice';
import { ProjectData } from '../store/project/projectTypes';
import { getTrainingProject, trainingProjectOptionsSelector } from '../store/trainingProjectSlice';
import { getAppInsights } from '../TelemetryService';
import { thunkPostProject } from '../store/project/projectActions';
import { ExpandPanel } from './ExpandPanel';

const sendTrainInfoToAppInsight = async (selectedParts): Promise<void> => {
  const { data: images } = await Axios.get('/api/images/');

  const selectedPartIds = selectedParts.map((e) => e.id);
  const interestedImagesLength = images.filter((e) => selectedPartIds.includes(e.part)).length;
  const appInsight = getAppInsights();
  if (appInsight)
    appInsight.trackEvent({
      name: 'train',
      properties: {
        images: interestedImagesLength,
        parts: selectedParts.length,
        source: '',
      },
    });
};

type ConfigTaskPanelProps = {
  isOpen: boolean;
  onDismiss: () => void;
  projectData: ProjectData;
};

export const ConfigTaskPanel: React.FC<ConfigTaskPanelProps> = ({
  isOpen,
  onDismiss,
  projectData: initialProjectData,
}) => {
  const cameraOptions = useSelector(cameraOptionsSelector);
  const partOptions = useSelector(partOptionsSelector);
  const trainingProjectOptions = useSelector(trainingProjectOptionsSelector);
  const dispatch = useDispatch();
  const history = useHistory();

  const [projectData, setProjectData] = useState(initialProjectData);

  function onChange<K extends keyof P, P = ProjectData>(key: K, value: P[K]) {
    setProjectData(R.assoc(key, value));
  }

  useEffect(() => {
    dispatch(getParts(false));
    dispatch(getCameras(false));
    dispatch(getTrainingProject());
  }, [dispatch]);

  const onStart = async () => {
    sendTrainInfoToAppInsight(projectData.parts);

    await dispatch(
      thunkPostProject(projectData.id, projectData.parts, projectData.camera, projectData.trainingProject),
    );

    onDismiss();
    history.push('/task');
  };

  const onRenderFooterContent = () => {
    return (
      <Stack tokens={{ childrenGap: 5 }} horizontal>
        <PrimaryButton text="Start" onClick={onStart} />
        <DefaultButton text="Cancel" onClick={onDismiss} />
      </Stack>
    );
  };

  return (
    <Panel
      isOpen={isOpen}
      onDismiss={onDismiss}
      hasCloseButton
      headerText="Start a task"
      onRenderFooterContent={onRenderFooterContent}
      isFooterAtBottom={true}
    >
      <Stack tokens={{ childrenGap: 10 }}>
        <Dropdown
          label="Task"
          options={trainingProjectOptions}
          required
          selectedKey={projectData.trainingProject}
          onChange={(_, options) => {
            onChange('trainingProject', options.key as number);
          }}
        />
        <Dropdown
          label="Camera"
          options={cameraOptions}
          required
          selectedKey={projectData.camera}
          onChange={(_, options) => {
            onChange('camera', options.key as number);
          }}
        />
        <Dropdown
          label="Part"
          multiSelect
          options={partOptions}
          required
          selectedKeys={projectData.parts}
          onChange={(_, option) => {
            if (option) {
              onChange(
                'parts',
                option.selected
                  ? [...projectData.parts, option.key as number]
                  : projectData.parts.filter((key) => key !== option.key),
              );
            }
          }}
        />
        <ExpandPanel title="Advanced settings">
          <Toggle
            label="Enable retraining"
            checked={projectData.needRetraining}
            onChange={(_, checked) => {
              onChange('needRetraining', checked);
            }}
          />
          <Text styles={{ root: { fontWeight: 'bold' } }}>Accuracy for capture images</Text>
          <TextField
            label="Minimum"
            type="number"
            value={projectData.accuracyRangeMin?.toString()}
            onChange={(_, newValue) => {
              onChange('accuracyRangeMin', parseInt(newValue, 10));
            }}
            suffix="%"
            disabled={!projectData.needRetraining}
          />
          <TextField
            label="Maximum"
            type="number"
            value={projectData.accuracyRangeMax?.toString()}
            onChange={(_, newValue) => {
              onChange('accuracyRangeMax', parseInt(newValue, 10));
            }}
            suffix="%"
            disabled={!projectData.needRetraining}
          />
          <TextField
            label="Minimum Images to store"
            type="number"
            value={projectData.maxImages?.toString()}
            onChange={(_, newValue) => {
              onChange('maxImages', parseInt(newValue, 10));
            }}
            disabled={!projectData.needRetraining}
          />
          <Toggle
            label="Send message to Azure"
            checked={projectData.sendMessageToCloud}
            onChange={(_, checked) => {
              onChange('sendMessageToCloud', checked);
            }}
          />
          <TextField
            label="Frame per minutes"
            type="number"
            value={projectData.framesPerMin?.toString()}
            onChange={(_, newValue) => {
              onChange('framesPerMin', parseInt(newValue, 10));
            }}
            disabled={!projectData.sendMessageToCloud}
          />
          <TextField
            label="Accuracy threshold"
            type="number"
            value={projectData.accuracyThreshold?.toString()}
            onChange={(_, newValue) => {
              onChange('accuracyThreshold', parseInt(newValue, 10));
            }}
            disabled={!projectData.sendMessageToCloud}
          />
        </ExpandPanel>
      </Stack>
    </Panel>
  );
};

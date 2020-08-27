import React, { useEffect, useState } from 'react';
import * as R from 'ramda';
import {
  Panel,
  Stack,
  PrimaryButton,
  DefaultButton,
  Dropdown,
  Checkbox,
  Text,
  TextField,
} from '@fluentui/react';
import { useSelector, useDispatch } from 'react-redux';

import { cameraOptionsSelector, getCameras } from '../store/cameraSlice';
import { partOptionsSelector, getParts } from '../store/partSlice';
import { ProjectData } from '../store/project/projectTypes';

export const ConfigTaskPanel: React.FC<{ isOpen: boolean; onDismiss: () => void }> = ({
  isOpen,
  onDismiss,
}) => {
  const cameraOptions = useSelector(cameraOptionsSelector);
  const partOptions = useSelector(partOptionsSelector);
  const dispatch = useDispatch();

  const [projectData, setProjectData] = useState<Partial<ProjectData>>({ camera: null, parts: [] });

  function onChange<K extends keyof P, P = ProjectData>(key: K, value: P[K]) {
    setProjectData(R.assoc(key, value));
  }

  useEffect(() => {
    dispatch(getParts(false));
    dispatch(getCameras(false));
  }, [dispatch]);

  const onStart = () => {
    console.log(projectData);
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
        <Checkbox
          label="Set up retraining"
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
        <Checkbox
          label="Send message to cloud"
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
      </Stack>
    </Panel>
  );
};

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

  const [projectData, setProjectData] = useState<Partial<ProjectData>>({});

  const onChange = (key: string, value) => {
    setProjectData(R.assoc(key, value));
  };

  useEffect(() => {
    dispatch(getParts(false));
    dispatch(getCameras(false));
  }, [dispatch]);

  const onRenderFooterContent = () => {
    return (
      <Stack tokens={{ childrenGap: 5 }} horizontal>
        <PrimaryButton text="Start" />
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
        <Dropdown label="Camera" options={cameraOptions} required />
        <Dropdown label="Part" options={partOptions} required />
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
            onChange('accuracyRangeMin', newValue);
          }}
          suffix="%"
          disabled={!projectData.needRetraining}
        />
        <TextField
          label="Maximum"
          type="number"
          value={projectData.accuracyRangeMax?.toString()}
          onChange={(_, newValue) => {
            onChange('accuracyRangeMax', newValue);
          }}
          suffix="%"
          disabled={!projectData.needRetraining}
        />
        <TextField
          label="Minimum Images to store"
          type="number"
          value={projectData.maxImages?.toString()}
          onChange={(_, newValue) => {
            onChange('maxImages', newValue);
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
            onChange('framesPerMin', newValue);
          }}
          disabled={!projectData.sendMessageToCloud}
        />
        <TextField
          label="Accuracy threshold"
          type="number"
          value={projectData.accuracyThreshold?.toString()}
          onChange={(_, newValue) => {
            onChange('accuracyThreshold', newValue);
          }}
          disabled={!projectData.sendMessageToCloud}
        />
      </Stack>
    </Panel>
  );
};

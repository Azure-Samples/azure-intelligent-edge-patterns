import React, { useState, useCallback } from 'react';
import { Panel, TextField, Stack, PrimaryButton, DefaultButton, ProgressIndicator } from '@fluentui/react';
import { useDispatch } from 'react-redux';
import * as R from 'ramda';

import { postCamera } from '../store/cameraSlice';

type AddCameraPanelProps = {
  isOpen: boolean;
  onDissmiss: () => void;
};

type FormData = {
  label: string;
  value: string;
  errMsg: string;
};

type Form = Record<string, FormData>;

const initialForm: Form = {
  name: { label: 'Camera name', value: '', errMsg: '' },
  rtsp: { label: 'RTSP URL', value: '', errMsg: '' },
  location: { label: 'Location', value: '', errMsg: '' },
};

export const AddCameraPanel: React.FC<AddCameraPanelProps> = ({ isOpen, onDissmiss }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Form>(initialForm);
  const dispatch = useDispatch();

  const onAdd = async () => {
    setLoading(true);
    await dispatch(postCamera({ name: formData.name.value, rtsp: formData.rtsp.value }));
    setLoading(false);
    setFormData(initialForm);
    onDissmiss();
  };

  const onRenderFooterContent = useCallback(
    () => (
      <Stack tokens={{ childrenGap: 5 }} horizontal>
        <PrimaryButton onClick={onAdd}>Add</PrimaryButton>
        <DefaultButton onClick={onDissmiss}>Cancel</DefaultButton>
      </Stack>
    ),
    [onAdd, onDissmiss],
  );

  const onChange = (key: string) => (_, newValue) => {
    setFormData(R.assocPath([key, 'value'], newValue));
  };

  return (
    <Panel
      isOpen={isOpen}
      onDismiss={onDissmiss}
      hasCloseButton
      headerText="Add Camera"
      onRenderFooterContent={onRenderFooterContent}
      isFooterAtBottom={true}
    >
      <ProgressIndicator progressHidden={!loading} />
      {Object.entries(formData).map(([key, value]) => (
        <TextField
          key={key}
          label={value.label}
          value={value.value}
          errorMessage={value.errMsg}
          onChange={onChange(key)}
          required
        />
      ))}
    </Panel>
  );
};

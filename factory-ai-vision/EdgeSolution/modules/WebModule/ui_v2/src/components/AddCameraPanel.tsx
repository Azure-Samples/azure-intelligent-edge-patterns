import React, { useState, useCallback, useEffect } from 'react';
import {
  Panel,
  TextField,
  Stack,
  PrimaryButton,
  DefaultButton,
  ProgressIndicator,
  Dropdown,
  IDropdownOption,
  Link,
} from '@fluentui/react';
import * as R from 'ramda';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';

import { postCamera } from '../store/cameraSlice';
import { selectAllLocations, getLocations } from '../store/locationSlice';
import { CreateLocationDialog } from './CreateLocationDialog';

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

const selectLocationOptions = createSelector(selectAllLocations, (locations) =>
  locations.map((l) => ({
    key: l.id,
    text: l.name,
  })),
);

export const AddCameraPanel: React.FC<AddCameraPanelProps> = ({ isOpen, onDissmiss }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Form>(initialForm);
  const [dialogHidden, setDialogHidden] = useState(true);
  const locationOptions = useSelector(selectLocationOptions);
  const dispatch = useDispatch();

  const validate = useCallback(() => {
    let hasError = false;

    Object.keys(formData).forEach((key) => {
      if (!formData[key].value) {
        setFormData(R.assocPath([key, 'errMsg'], `${formData[key].label} is required`));
        hasError = true;
      }
    });
    return hasError;
  }, [formData]);

  const onAdd = useCallback(async () => {
    if (validate()) return;

    setLoading(true);
    await dispatch(postCamera({ name: formData.name.value, rtsp: formData.rtsp.value }));
    setLoading(false);
    setFormData(initialForm);
    onDissmiss();
  }, [dispatch, formData.name.value, formData.rtsp.value, onDissmiss, validate]);

  const onRenderFooterContent = useCallback(
    () => (
      <Stack tokens={{ childrenGap: 5 }} horizontal>
        <PrimaryButton onClick={onAdd} disabled={loading}>
          Add
        </PrimaryButton>
        <DefaultButton onClick={onDissmiss}>Cancel</DefaultButton>
      </Stack>
    ),
    [loading, onAdd, onDissmiss],
  );

  const onChange = (key: string) => (_, newValue) => {
    setFormData(R.assocPath([key, 'value'], newValue));
  };

  const onChangeLocation = (_, options: IDropdownOption) => {
    setFormData(R.assocPath(['location', 'value'], options.key));
  };

  const onLocationCreateSuccess = (id: number) => {
    setFormData(R.assocPath(['location', 'value'], id));
  };

  useEffect(() => {
    dispatch(getLocations(false));
  }, [dispatch]);

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
      <TextField
        label={formData.name.label}
        value={formData.name.value}
        errorMessage={formData.name.errMsg}
        onChange={onChange('name')}
        required
      />
      <TextField
        label={formData.rtsp.label}
        value={formData.rtsp.value}
        errorMessage={formData.rtsp.errMsg}
        onChange={onChange('rtsp')}
        required
      />
      <Dropdown
        key="location"
        label={formData.location.label}
        selectedKey={formData.location.value}
        options={locationOptions}
        errorMessage={formData.location.errMsg}
        onChange={onChangeLocation}
        required
      />
      <Link onClick={() => setDialogHidden(false)}>Create location</Link>
      <CreateLocationDialog
        hidden={dialogHidden}
        onDismiss={() => setDialogHidden(true)}
        onCreatSuccess={onLocationCreateSuccess}
      />
    </Panel>
  );
};

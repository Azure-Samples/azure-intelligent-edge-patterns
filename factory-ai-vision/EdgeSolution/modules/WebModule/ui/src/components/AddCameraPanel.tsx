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

import { postCamera, putCamera } from '../store/cameraSlice';
import { selectAllLocations, getLocations, postLocation } from '../store/locationSlice';
import { CreateByNameDialog } from './CreateByNameDialog';

export enum PanelMode {
  Create,
  Update,
}

type AddEditCameraPanelProps = {
  isOpen: boolean;
  onDissmiss: () => void;
  mode: PanelMode;
  initialValue?: Form;
  cameraId?: number;
};

type FormData<V> = {
  value: V;
  errMsg: string;
};

type Form = {
  name: FormData<string>;
  rtsp: FormData<string>;
  location: FormData<number>;
};

const initialForm: Form = {
  name: { value: '', errMsg: '' },
  rtsp: { value: '', errMsg: '' },
  location: { value: null, errMsg: '' },
};

const selectLocationOptions = createSelector(selectAllLocations, (locations) =>
  locations.map((l) => ({
    key: l.id,
    text: l.name,
  })),
);

export const AddEditCameraPanel: React.FC<AddEditCameraPanelProps> = ({
  isOpen,
  onDissmiss,
  mode,
  initialValue = initialForm,
  cameraId,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Form>(initialValue);
  const [dialogHidden, setDialogHidden] = useState(true);
  const locationOptions = useSelector(selectLocationOptions);
  const dispatch = useDispatch();

  const validate = useCallback(() => {
    let hasError = false;

    Object.keys(formData).forEach((key) => {
      if (!formData[key].value) {
        setFormData(R.assocPath([key, 'errMsg'], `This field is required`));
        hasError = true;
      }
    });
    return hasError;
  }, [formData]);

  const onConfirm = useCallback(async () => {
    if (validate()) return;

    setLoading(true);
    if (mode === PanelMode.Create) {
      await dispatch(
        postCamera({
          name: formData.name.value,
          rtsp: formData.rtsp.value,
          location: formData.location.value,
        }),
      );
      setFormData(initialForm);
    } else {
      await dispatch(
        putCamera({
          id: cameraId,
          name: formData.name.value,
          rtsp: formData.rtsp.value,
          location: formData.location.value,
        }),
      );
    }
    setLoading(false);
    onDissmiss();
  }, [
    cameraId,
    dispatch,
    formData.location.value,
    formData.name.value,
    formData.rtsp.value,
    mode,
    onDissmiss,
    validate,
  ]);

  const onRenderFooterContent = useCallback(
    () => (
      <Stack tokens={{ childrenGap: 5 }} horizontal>
        <PrimaryButton onClick={onConfirm} disabled={loading}>
          {mode === PanelMode.Create ? 'Add' : 'Update'}
        </PrimaryButton>
        <DefaultButton onClick={onDissmiss}>Cancel</DefaultButton>
      </Stack>
    ),
    [loading, mode, onConfirm, onDissmiss],
  );

  const onChange = (key: string) => (_, newValue) => {
    setFormData(R.assocPath([key, 'value'], newValue));
  };

  const onChangeLocation = (_, options: IDropdownOption) => {
    setFormData(R.assocPath(['location', 'value'], options.key));
  };

  const onLocationCreate = async (name: string) => {
    const res = await dispatch(postLocation({ name }));
    setFormData(R.assocPath(['location', 'value'], (res as any).payload.id));
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
        label="Camera name"
        value={formData.name.value}
        errorMessage={formData.name.errMsg}
        onChange={onChange('name')}
        required
      />
      <TextField
        label="RTSP URL"
        value={formData.rtsp.value}
        errorMessage={formData.rtsp.errMsg}
        onChange={onChange('rtsp')}
        required
      />
      <Dropdown
        label="Location"
        selectedKey={formData.location.value}
        options={locationOptions}
        errorMessage={formData.location.errMsg}
        onChange={onChangeLocation}
        required
      />
      <Link onClick={() => setDialogHidden(false)}>Create location</Link>
      <CreateByNameDialog
        title="Create location"
        subText="Enter the location where this camera is pointed:"
        hidden={dialogHidden}
        onDismiss={() => setDialogHidden(true)}
        onCreate={onLocationCreate}
      />
    </Panel>
  );
};

/* eslint-disable @typescript-eslint/camelcase */

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
import { connect, useDispatch } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';

import { State } from 'RootStateType';
import {
  postRTSPCamera,
  putRTSPCamera,
  postMediaSourceCamera,
  putMediaSourceCamera,
} from '../store/cameraSlice';
import { selectAllLocations, getLocations, postLocation } from '../store/locationSlice';
import { thunkUpdateCameraSetting } from '../store/cameraSetting/cameraSettingActions';

import { CreateByNameDialog } from './CreateByNameDialog';

export enum PanelMode {
  Create,
  Update,
}

type OwnProps = {
  isOpen: boolean;
  onDissmiss: () => void;
  mode: PanelMode;
  initialValue?: Form;
  cameraId?: number;
};

type AddEditCameraPanelProps = OwnProps & {
  locationOptions: IDropdownOption[];
};

type FormData<V> = {
  value: V;
  errMsg: string;
};

type Form = {
  name: FormData<string>;
  url: FormData<string>;
  location: FormData<number>;
};

const initialForm: Form = {
  name: { value: '', errMsg: '' },
  url: { value: '', errMsg: '' },
  location: { value: null, errMsg: '' },
};

const selectLocationOptions = createSelector(selectAllLocations, (locations) =>
  locations.map((l) => ({
    key: l.id,
    text: l.name,
  })),
);

export const Component: React.FC<AddEditCameraPanelProps> = ({
  isOpen,
  onDissmiss,
  mode,
  locationOptions,
  initialValue = initialForm,
  cameraId,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Form>(initialValue);
  const [dialogHidden, setDialogHidden] = useState(true);
  const [createByMediaSource, setCreateByMediaSource] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const regex = new RegExp('^rtsp:');

    if (!regex.test(initialValue.url.value) && initialValue.url.value !== '') {
      setCreateByMediaSource(true);
    }
  }, [initialValue]);

  const validate = useCallback(() => {
    let hasError = false;

    Object.keys(formData).forEach((key) => {
      if (!formData[key].value && formData[key].value !== 0) {
        setFormData(R.assocPath([key, 'errMsg'], `This field is required`));
        hasError = true;
      }
    });
    return hasError;
  }, [formData]);

  const onRTSPConfirm = useCallback(async () => {
    if (validate()) return;

    setLoading(true);
    if (mode === PanelMode.Create) {
      await dispatch(
        postRTSPCamera({
          name: formData.name.value,
          rtsp: formData.url.value,
          location: formData.location.value,
        }),
      );
      setFormData(initialForm);
    } else {
      await dispatch(
        putRTSPCamera({
          id: cameraId,
          name: formData.name.value,
          rtsp: formData.url.value,
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
    formData.url.value,
    mode,
    onDissmiss,
    validate,
  ]);

  const onMediaSourceConfirm = useCallback(async () => {
    if (validate()) return;

    setLoading(true);
    if (mode === PanelMode.Create) {
      await dispatch(
        postMediaSourceCamera({
          name: formData.name.value,
          media_source: formData.url.value,
          location: formData.location.value,
        }),
      );
      setFormData(initialForm);
    } else {
      await dispatch(
        putMediaSourceCamera({
          id: cameraId,
          name: formData.name.value,
          media_source: formData.url.value,
          location: formData.location.value,
        }),
      );
    }
    setLoading(false);
    onDissmiss();
    alert('Please wait, video is downloading.');
    dispatch(thunkUpdateCameraSetting());
  }, [
    cameraId,
    dispatch,
    formData.location.value,
    formData.name.value,
    formData.url.value,
    mode,
    onDissmiss,
    validate,
  ]);

  const onRenderFooterContent = useCallback(
    () => (
      <Stack tokens={{ childrenGap: 5 }} horizontal>
        <PrimaryButton
          onClick={createByMediaSource ? onMediaSourceConfirm : onRTSPConfirm}
          disabled={loading}
        >
          {mode === PanelMode.Create ? 'Add' : 'Update'}
        </PrimaryButton>
        <DefaultButton onClick={onDissmiss}>Cancel</DefaultButton>
      </Stack>
    ),
    [loading, mode, onDissmiss, onRTSPConfirm, onMediaSourceConfirm, createByMediaSource],
  );

  const onChange = (key: string) => (_, newValue) => {
    const regex = new RegExp('^rtsp:');

    if (key === 'url' && !regex.test(newValue)) {
      setCreateByMediaSource(true);
    } else {
      setCreateByMediaSource(false);
    }

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
      headerText={mode === PanelMode.Create ? 'Add Camera' : 'Edit Camera'}
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
      {mode === PanelMode.Create && (
        <Dropdown
          label="Create by"
          selectedKey={createByMediaSource ? 'createByMedia' : 'createByRTSP'}
          onChange={(_, option) => setCreateByMediaSource(option.key === 'createByMedia')}
          options={[
            { key: 'createByMedia', text: 'Media source' },
            { key: 'createByRTSP', text: 'RTSP URL' },
          ]}
        />
      )}
      <TextField
        label={createByMediaSource ? 'Media source URL' : 'RTSP URL'}
        value={formData.url.value}
        errorMessage={formData.url.errMsg}
        onChange={onChange('url')}
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

const mapState = (state: State, ownProps: OwnProps): AddEditCameraPanelProps => {
  return {
    ...ownProps,
    locationOptions: selectLocationOptions(state),
  };
};

export default connect(mapState)(Component);

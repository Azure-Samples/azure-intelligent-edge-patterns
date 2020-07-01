import React from 'react';
import { useDispatch } from 'react-redux';

import { AddModuleDialog } from '.';
import { postCamera } from '../../store/camera/cameraActions';

export const AddCameraLink = () => {
  const dispatch = useDispatch();

  return (
    <AddModuleDialog
      header="Add Camera"
      fields={[
        {
          placeholder: 'Name',
          key: 'name',
          type: 'input',
          required: true,
        },
        {
          placeholder: 'RTSP URL',
          key: 'rtsp',
          type: 'input',
          required: true,
        },
      ]}
      trigger={<p style={{ textDecoration: 'underline', cursor: 'pointer' }}>Add Camera</p>}
      onConfirm={({ name, rtsp }): void => {
        (dispatch(postCamera({ name, rtsp, is_demo: false })) as any)
          .then(() => window.location.reload())
          .catch(alert);
      }}
    />
  );
};

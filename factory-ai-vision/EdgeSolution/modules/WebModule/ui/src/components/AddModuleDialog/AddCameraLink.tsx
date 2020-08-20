import React from 'react';
import { useDispatch } from 'react-redux';

import { AddModuleDialog } from '.';
import { postCamera } from '../../store/cameraSlice';

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
      onConfirm={async ({ name, rtsp }) => {
        try {
          await dispatch(postCamera({ name, rtsp }));
          window.location.reload();
        } catch (e) {
          alert(e);
        }
      }}
    />
  );
};

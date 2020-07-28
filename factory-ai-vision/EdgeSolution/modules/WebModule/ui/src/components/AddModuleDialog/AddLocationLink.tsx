import React from 'react';
import { useDispatch } from 'react-redux';

import { AddModuleDialog } from '.';
import { postLocation } from '../../action/creators/locationActionCreators';

export const AddLocationLink = () => {
  const dispatch = useDispatch();

  return (
    <AddModuleDialog
      header="Add Location"
      fields={[
        {
          placeholder: 'Location Name',
          key: 'name',
          type: 'input',
          required: true,
        },
        {
          placeholder: 'Description',
          key: 'description',
          type: 'textArea',
          required: false,
        },
      ]}
      trigger={<p style={{ textDecoration: 'underline', cursor: 'pointer' }}>Add Location</p>}
      onConfirm={({ name, description }): void => {
        (dispatch(postLocation({ name, description, is_demo: false })) as any)
          .then(() => window.location.reload())
          .catch((e) => alert(e));
      }}
    />
  );
};

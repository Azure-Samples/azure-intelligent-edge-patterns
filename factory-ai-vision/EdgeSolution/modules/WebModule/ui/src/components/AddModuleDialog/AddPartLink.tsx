import React from 'react';
import Axios from 'axios';

import { AddModuleDialog } from '.';

export const AddPartLink = () => {
  return (
    <AddModuleDialog
      trigger={<p style={{ textDecoration: 'underline', cursor: 'pointer' }}>Add Part</p>}
      header="Add Part"
      fields={[
        {
          placeholder: 'Part Name',
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
      onConfirm={({ name, description }): void => {
        // TODO Migrate this to part action
        Axios({
          method: 'POST',
          url: `/api/parts/`,
          data: {
            name,
            description,
          },
        })
          .then(() => window.location.reload())
          .catch((err) => {
            alert(err);
          });
      }}
    />
  );
};

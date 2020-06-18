import React, { useState } from 'react';
import { Dialog, Input, Flex } from '@fluentui/react-northstar';
import * as R from 'ramda';

import AddButton from '../AddButton';

type AddModuleDialogProps = {
  fields: { placeholder: string; key: string }[];
  onConfirm: (formData: Record<string, string>) => void;
};

export const AddModuleDialog: React.FC<AddModuleDialogProps> = ({ fields, onConfirm }) => {
  const [formData, setFormData] = useState({});

  return (
    <Dialog
      styles={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '50%' }}
      confirmButton="Submit"
      cancelButton="Cancel"
      onConfirm={(): void => onConfirm(formData)}
      header=" Add Camera"
      trigger={
        <div style={{ alignSelf: 'flex-end' }}>
          <AddButton />
        </div>
      }
      content={
        <Flex column gap="gap.large" hAlign="center">
          {fields.map((e) => (
            <Input
              key={e.key}
              placeholder={e.placeholder}
              value={formData[e.key]}
              onChange={(_, { value }): void => setFormData(R.assoc(e.key, value, formData))}
            />
          ))}
        </Flex>
      }
    />
  );
};

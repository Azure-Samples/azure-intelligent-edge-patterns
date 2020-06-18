import React, { useState } from 'react';
import { Dialog, Input, Flex, TextArea } from '@fluentui/react-northstar';
import * as R from 'ramda';

import AddButton from '../AddButton';

type AddModuleDialogProps = {
  header: string;
  fields: { placeholder: string; key: string; type: 'input' | 'textArea' }[];
  onConfirm: (formData: Record<string, string>) => void;
};

export const AddModuleDialog: React.FC<AddModuleDialogProps> = ({ header, fields, onConfirm }) => {
  const [formData, setFormData] = useState({});

  return (
    <Dialog
      styles={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '500px',
      }}
      confirmButton="Submit"
      cancelButton="Cancel"
      onConfirm={(): void => onConfirm(formData)}
      header={header}
      trigger={
        <div style={{ alignSelf: 'flex-end' }}>
          <AddButton />
        </div>
      }
      content={
        <Flex column gap="gap.large" hAlign="center">
          {fields.map((e) =>
            e.type === 'input' ? (
              <Input
                key={e.key}
                placeholder={e.placeholder}
                value={formData[e.key]}
                onChange={(_, { value }): void => setFormData(R.assoc(e.key, value, formData))}
                fluid
              />
            ) : (
              <TextArea
                key={e.key}
                placeholder={e.placeholder}
                value={formData[e.key]}
                onChange={(_, { value }): void => setFormData(R.assoc(e.key, value, formData))}
                styles={{ height: '100px' }}
                fluid
              />
            ),
          )}
        </Flex>
      }
    />
  );
};

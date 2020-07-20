import React, { useState } from 'react';
import { Input, Flex, TextArea } from '@fluentui/react-northstar';
import * as R from 'ramda';

import AddButton from '../AddButton';
import { Dialog } from '../Dialog';

export type AddModuleDialogProps = {
  header: string;
  fields: { placeholder: string; key: string; type: 'input' | 'textArea'; required: boolean }[];
  onConfirm: (formData: Record<string, string>) => void;
  trigger?: JSX.Element;
};

export const AddModuleDialog: React.FC<AddModuleDialogProps> = ({ trigger, header, fields, onConfirm }) => {
  const [formData, setFormData] = useState(
    fields.reduce((acc, cur) => {
      return { ...acc, [cur.key]: '' };
    }, {}),
  );

  const isSubmitDisabled = fields.some((e) => e.required && !formData[e.key]);

  return (
    <Dialog
      styles={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '500px',
      }}
      confirmButton={{ content: 'Submit', disabled: isSubmitDisabled }}
      cancelButton="Cancel"
      onConfirm={(): void => onConfirm(formData)}
      header={header}
      trigger={
        trigger || (
          <div style={{ alignSelf: 'flex-end' }}>
            <AddButton />
          </div>
        )
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
                required={e.required}
              />
            ) : (
              <TextArea
                key={e.key}
                placeholder={e.placeholder}
                value={formData[e.key]}
                onChange={(_, { value }): void => setFormData(R.assoc(e.key, value, formData))}
                styles={{ height: '100px' }}
                fluid
                required={e.required}
              />
            ),
          )}
        </Flex>
      }
    />
  );
};

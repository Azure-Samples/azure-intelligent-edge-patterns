import { TextField, Toggle } from '@fluentui/react';
import React from 'react';
import { OptionLayout } from './OptionLayout';
import { OnChangeType } from './type';

type CloudMsgOptionProps = {
  sendMessageToCloud: boolean;
  framesPerMin: number;
  onChange: OnChangeType;
};

export const CloudMsgOption: React.FC<CloudMsgOptionProps> = ({
  sendMessageToCloud,
  framesPerMin,
  onChange,
}) => {
  return (
    <OptionLayout title="Cloud messaging" subTitle="Send successful inferences to the cloud">
      <Toggle
        label="Enable cloud messages"
        checked={sendMessageToCloud}
        onChange={(_, checked) => {
          onChange('sendMessageToCloud', checked);
        }}
        inlineLabel
      />
      {sendMessageToCloud && (
        <TextField
          label="Frames per minute"
          type="number"
          value={framesPerMin?.toString()}
          onChange={(_, newValue) => {
            onChange('framesPerMin', parseInt(newValue, 10));
          }}
          disabled={!sendMessageToCloud}
          required
        />
      )}
    </OptionLayout>
  );
};

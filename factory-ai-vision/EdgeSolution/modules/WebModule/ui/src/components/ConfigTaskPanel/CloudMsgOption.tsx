import { TextField, Toggle } from '@fluentui/react';
import React, { FC } from 'react';
import { ProjectData } from '../../store/project/projectTypes';
import { OptionLayout } from './OptionLayout';
import { OnChangeType } from './type';

type PropsType = Pick<ProjectData, 'sendMessageToCloud' | 'framesPerMin' | 'probThreshold'> & {
  onChange: OnChangeType;
};

export const CloudMsgOption: FC<PropsType> = ({
  sendMessageToCloud,
  framesPerMin,
  probThreshold,
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
        <>
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
          <TextField
            label="Confirmation threshold"
            type="number"
            value={probThreshold?.toString()}
            onChange={(_, newValue) => {
              onChange('probThreshold', parseInt(newValue, 10));
            }}
            disabled={!sendMessageToCloud}
            required
          />
        </>
      )}
    </OptionLayout>
  );
};

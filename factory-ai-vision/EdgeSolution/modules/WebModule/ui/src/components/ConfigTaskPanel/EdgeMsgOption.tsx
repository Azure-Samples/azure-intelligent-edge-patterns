import { Toggle } from '@fluentui/react';
import React from 'react';
import { ProjectData } from '../../store/project/projectTypes';
import { OptionLayout } from './OptionLayout';
import { OnChangeType } from './type';

type Props = Pick<ProjectData, 'sendMessageToEdge'> & {
  onChange: OnChangeType;
};

const EdgeMsgOption = (props: Props) => {
  const { sendMessageToEdge, onChange } = props;

  return (
    <OptionLayout title="Edge messaging" subTitle="Send successful inferences to AVA edge device">
      <Toggle
        label="Enable edge messages"
        checked={sendMessageToEdge}
        onChange={(_, checked) => {
          onChange('sendMessageToEdge', checked);
        }}
        inlineLabel
      />
    </OptionLayout>
  );
};

export default EdgeMsgOption;

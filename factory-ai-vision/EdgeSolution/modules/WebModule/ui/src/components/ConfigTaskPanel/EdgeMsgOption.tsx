import { Toggle } from '@fluentui/react';
import React from 'react';
import { ProjectData } from '../../store/project/projectTypes';
import { OptionLayout } from './OptionLayout';
import { OnChangeType } from './type';

type Props = Pick<ProjectData, 'ava_is_send_iothub'> & {
  onChange: OnChangeType;
};

const EdgeMsgOption = (props: Props) => {
  const { ava_is_send_iothub, onChange } = props;

  return (
    <OptionLayout title="Edge messaging" subTitle="Send successful inferences to AVA edge device">
      <Toggle
        label="Enable edge messages"
        checked={ava_is_send_iothub}
        onChange={(_, checked) => {
          onChange('ava_is_send_iothub', checked);
        }}
        inlineLabel
      />
    </OptionLayout>
  );
};

export default EdgeMsgOption;

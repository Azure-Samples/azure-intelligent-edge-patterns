import React from 'react';
import { Stack, PrimaryButton, Text } from '@fluentui/react';

type EmptyAddIconProps = {
  onAddBtnClick: () => void;
  btnTxt: string;
  text: string;
};

export const EmptyAddIcon: React.FC<EmptyAddIconProps> = ({ onAddBtnClick, btnTxt, text }) => (
  <Stack tokens={{ childrenGap: 10 }} verticalAlign="center" grow>
    <Stack.Item align="center">
      <img src="/icon/emptyIcon.png" />
    </Stack.Item>
    <Stack.Item align="center">
      <Text>{text}</Text>
    </Stack.Item>

    <Stack.Item align="center">
      <PrimaryButton text={btnTxt} onClick={onAddBtnClick} />
    </Stack.Item>
  </Stack>
);

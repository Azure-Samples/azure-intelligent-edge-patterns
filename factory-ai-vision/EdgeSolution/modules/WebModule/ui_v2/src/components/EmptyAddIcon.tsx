import React from 'react';
import { Stack, PrimaryButton, Text, DefaultButton } from '@fluentui/react';

type ButtonProps = {
  text: string;
  onClick: () => void;
};

type EmptyAddIconProps = {
  title: string;
  subTitle: string;
  primary: ButtonProps;
  secondary?: ButtonProps;
};

export const EmptyAddIcon: React.FC<EmptyAddIconProps> = ({ title, subTitle, primary, secondary }) => (
  <Stack tokens={{ childrenGap: 10 }} verticalAlign="center" grow horizontalAlign="center">
    <img src="/icons/emptyIcon.png" />
    <Text variant="xLarge">{title}</Text>
    <Text>{subTitle}</Text>
    <PrimaryButton text={primary.text} onClick={primary.onClick} />
    {secondary && <DefaultButton text={secondary.text} onClick={secondary.onClick} />}
  </Stack>
);

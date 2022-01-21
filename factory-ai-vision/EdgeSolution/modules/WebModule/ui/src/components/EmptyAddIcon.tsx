import React, { ReactNode } from 'react';
import { Stack, PrimaryButton, Text, DefaultButton } from '@fluentui/react';

type ButtonProps = {
  text: string;
  onClick: () => void;
};

type EmptyAddIconProps = {
  title: string;
  subTitle: string;
  primary?: ButtonProps;
  secondary?: ButtonProps;
  node?: ReactNode;
};

export const EmptyAddIcon: React.FC<EmptyAddIconProps> = ({ title, subTitle, primary, secondary, node }) => (
  <Stack tokens={{ childrenGap: 10 }} verticalAlign="center" grow horizontalAlign="center">
    <img src="/icons/emptyIcon.png" alt="icon" />
    <Text variant="xLarge">{title}</Text>
    <Text>{subTitle}</Text>
    {primary && <PrimaryButton text={primary.text} onClick={primary.onClick} />}
    {secondary && <DefaultButton text={secondary.text} onClick={secondary.onClick} />}
    {node && node}
  </Stack>
);

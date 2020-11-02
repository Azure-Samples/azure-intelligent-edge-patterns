import { Stack, Label, Text, mergeStyleSets } from '@fluentui/react';
import React from 'react';

const classNames = mergeStyleSets({
  textWrapper: {
    paddingBottom: '16px',
  },
});

type OptionLayoutProps = {
  title: string;
  subTitle?: string;
};

export const OptionLayout: React.FC<OptionLayoutProps> = ({ title, subTitle = '', children }) => {
  return (
    <Stack.Item disableShrink>
      <div className={classNames.textWrapper}>
        <Label>{title}</Label>
        <Text>{subTitle}</Text>
      </div>
      {children}
    </Stack.Item>
  );
};

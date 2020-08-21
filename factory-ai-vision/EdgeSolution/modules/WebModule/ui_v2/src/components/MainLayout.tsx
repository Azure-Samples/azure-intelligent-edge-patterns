import React from 'react';
import { TopNav } from './TopNav';
import { LeftNav } from './LeftNav';
import { Stack } from '@fluentui/react';

export const MainLayout: React.FC = ({ children }) => {
  return (
    <Stack styles={{ root: { height: '100vh' } }}>
      <TopNav />
      <Stack grow={1} horizontal>
        <LeftNav />
        <div>{children}</div>
      </Stack>
    </Stack>
  );
};

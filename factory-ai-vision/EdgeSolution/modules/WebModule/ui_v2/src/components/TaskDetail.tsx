import React from 'react';
import { Stack } from '@fluentui/react';
import { LiveViewContainer } from './LiveViewContainer';

export const TaskDetail: React.FC = () => {
  return (
    <Stack horizontal styles={{ root: { height: '100%' } }}>
      <div style={{ width: '30%' }}></div>
      <div style={{ height: '90%', width: '70%' }}>
        <LiveViewContainer showVideo={true} cameraId={2} onDeleteProject={() => {}} />
      </div>
    </Stack>
  );
};

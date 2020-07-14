import React from 'react';
import { Flex } from '@fluentui/react-northstar';
import { ProjectConfig } from '../components/ProjectConfigPanel/ProjectConfig';
import { LiveViewDashboard } from '../components/LiveViewDashboard';

export const PartIdentification: React.FC<{ isDemo: boolean }> = ({ isDemo }) => {
  return (
    <Flex styles={{ height: '100%' }}>
      <div style={{ flexGrow: 2 }}>
        <ProjectConfig isDemo={isDemo} />
      </div>
      <div style={{ flexGrow: 3 }}>
        <LiveViewDashboard isDemo={isDemo} />
      </div>
    </Flex>
  );
};

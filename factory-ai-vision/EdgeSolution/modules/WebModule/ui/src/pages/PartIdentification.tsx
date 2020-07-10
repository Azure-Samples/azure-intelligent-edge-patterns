import React from 'react';
import { Flex } from '@fluentui/react-northstar';
import { ProjectConfig } from '../components/ProjectConfigPanel/ProjectConfig';
import { LiveViewContainer } from '../components/LiveViewContainer';

export const PartIdentification: React.FC = () => {
  return (
    <Flex>
      <div style={{ flexGrow: 2 }}>
        <ProjectConfig />
      </div>
      <div style={{ flexGrow: 3 }}>
        <LiveViewContainer showVideo={true} initialAOIData={{ useAOI: false, AOIs: [] }} cameraId={0} />
      </div>
    </Flex>
  );
};

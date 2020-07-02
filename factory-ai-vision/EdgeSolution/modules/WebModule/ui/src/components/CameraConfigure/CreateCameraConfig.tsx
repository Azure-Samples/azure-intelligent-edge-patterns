import React from 'react';
import { Button, Flex, AddIcon } from '@fluentui/react-northstar';
import { Link } from 'react-router-dom';

export const CreateCameraConfigButton: React.FC = () => {
  return (
    <div style={{ height: '100%' }}>
      <h1>Configuration</h1>
      <Flex hAlign="center" vAlign="center" design={{ height: '100%' }} column gap="gap.large">
        <Button
          fluid
          circular
          content={<AddIcon size="largest" circular color="brand" />}
          style={{ width: 100, height: 100, border: '5px solid #0094d8' }}
          color="brand"
          as={Link}
          to="/partIdentification"
        />
        <h2>Configure Task for the Device</h2>
      </Flex>
    </div>
  );
};

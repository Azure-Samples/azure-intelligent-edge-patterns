import React from 'react';
import { Divider, Flex, Text, Input, Button } from '@fluentui/react-northstar';

export const Setting = (): JSX.Element => {
  return (
    <Flex column gap="gap.large">
      <h1>Setting</h1>
      <Divider color="grey" />
      <Flex vAlign="center">
        <Text size="large" design={{ width: '300px' }}>
          Identification Confidence%:
        </Text>
        <Input />
      </Flex>
      <Text size="large" weight="bold">
        Azure Cognitive Services Settings:{' '}
      </Text>
      <Flex vAlign="center">
        <Text size="large" design={{ width: '300px' }}>
          Name Space:
        </Text>
        <Input />
      </Flex>
      <Flex vAlign="center">
        <Text size="large" design={{ width: '300px' }}>
          Key:
        </Text>
        <Input />
      </Flex>
      <Flex gap="gap.large">
        <Button primary>Save</Button>
        <Button primary>Cancel</Button>
      </Flex>
    </Flex>
  );
};

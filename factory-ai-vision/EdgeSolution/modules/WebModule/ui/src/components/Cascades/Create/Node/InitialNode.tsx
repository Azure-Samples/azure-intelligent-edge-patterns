import React from 'react';
import { Stack, Text, Icon } from '@fluentui/react';

const InitialNode = () => {
  return (
    <Stack
      styles={{
        root: {
          width: '150px',
          border: '1px solid #C4C4C4',
          borderRadius: '2px',
          padding: '15px',
          backgroundColor: '#FFF',
        },
      }}
      horizontal
      verticalAlign="center"
      tokens={{ childrenGap: 10 }}
    >
      <Icon styles={{ root: { fontSize: '24px' } }} iconName="Camera" />
      <Text styles={{ root: { fontSize: '14px', lineHeight: '20px' } }}>Camera Input</Text>
    </Stack>
  );
};

export default InitialNode;

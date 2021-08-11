import React from 'react';
import { Stack } from '@fluentui/react';

const TransformCard = () => {
  return (
    <Stack
      styles={{
        root: {
          padding: 0,
          width: '300px',
          boxShadow: '0px 0.3px 0.9px rgba(0, 0, 0, 0.1), 0px 1.6px 3.6px rgba(0, 0, 0, 0.13)',
          border: 'none',
          backgroundColor: '#FFF',
        },
      }}
      horizontal
    >
      <img style={{ height: '60px', width: '60px' }} src="/icons/transformCard.png" alt="icon" />
      <Stack>
        <Stack>Crop</Stack>
        <Stack>Transform</Stack>
      </Stack>
    </Stack>
  );
};

export default TransformCard;

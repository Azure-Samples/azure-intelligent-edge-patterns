import React from 'react';
import { Stack } from '@fluentui/react';

const ExportCard = () => {
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
      <img style={{ height: '60px', width: '60px' }} src="/icons/exportCard.png" alt="icon" />
      <Stack>
        <Stack>placeholder.json</Stack>
        <Stack>Export</Stack>
      </Stack>
    </Stack>
  );
};

export default ExportCard;

import React from 'react';
import {} from '../themes/mainTheme';
import { Box } from '@fluentui/react-northstar';

const progressContainerStyle: React.CSSProperties = {
  display: 'flex',
  border: 'solid grey 1px',
  height: '10px',
  borderRadius: '10px',
  width: '100%',
};

const getProgressStyle = (percentage) => ({ theme: { siteVariables } }): any => ({
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: siteVariables.colorScheme.brand.foreground,
  height: '100%',
  borderRadius: '5px',
  width: `${percentage}%`,
});

export const ProgressBar: React.FC<{ percentage: number }> = ({ percentage }) => {
  return (
    <Box style={progressContainerStyle}>
      <Box styles={getProgressStyle(percentage)} />
    </Box>
  );
};

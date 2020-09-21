import React from 'react';
import {} from '../themes/mainTheme';
import { Box, Animation, Provider } from '@fluentui/react-northstar';

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
  transitionDuration: '3s',
  position: 'relative',
});

const progressAniItem: React.CSSProperties = {
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  borderRadius: '5px',
  transitionDuration: '3s',
  position: 'absolute',
  background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.3))',
};

const progress = {
  keyframe: {
    from: {
      width: '0%',
    },
    to: {
      width: '100%',
    },
  },
  duration: '1.5s',
  iterationCount: 'infinite',
};

export const ProgressBar: React.FC<{ percentage: number }> = ({ percentage }) => {
  return (
    <Provider theme={{ animations: { progress } }}>
      <Box style={progressContainerStyle}>
        <Box styles={getProgressStyle(percentage)}>
          <Animation name="progress">
            <Box styles={progressAniItem} />
          </Animation>
        </Box>
      </Box>
    </Provider>
  );
};

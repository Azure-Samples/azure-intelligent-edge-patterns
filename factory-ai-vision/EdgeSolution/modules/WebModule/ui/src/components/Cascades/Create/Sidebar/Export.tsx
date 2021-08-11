import React, { useCallback } from 'react';
import { Stack } from '@fluentui/react';

import { getClasses } from './style';

const Transform = () => {
  const classes = getClasses();

  const onDragStart = useCallback((event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('cardCategory', 'model');
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  return (
    <Stack
      onDragStart={(event) => onDragStart(event, 'export')}
      draggable
      styles={{
        root: classes.root,
      }}
    >
      <Stack horizontal>
        <img style={{ height: '60px', width: '60px' }} src="/icons/exportCard.png" alt="icon" />
        <Stack>Export Node</Stack>
      </Stack>
    </Stack>
  );
};

export default Transform;

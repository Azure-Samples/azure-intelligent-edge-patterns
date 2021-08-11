import React, { useCallback } from 'react';
import { Stack } from '@fluentui/react';

const Transform = () => {
  const onDragStart = useCallback((event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('cardCategory', 'model');
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  return (
    <Stack
      onDragStart={(event) => onDragStart(event, 'transform')}
      draggable
      styles={{
        root: {
          borderBottom: '1px solid #605E5C',
        },
      }}
    >
      <Stack horizontal>
        <img style={{ height: '60px', width: '60px' }} src="/icons/transformCard.png" alt="icon" />
        <Stack>Crop</Stack>
      </Stack>
    </Stack>
  );
};

export default Transform;

import React, { useState, useEffect, FC } from 'react';
import { Line, Group, Circle } from 'react-konva';
import { KonvaEventObject } from 'konva/types/Node';

import { BoxLabel, Box2dComponentProps, WorkState } from './types';
import { updateAnnotation } from '../../actions/labelingPage';

export const Box2d: FC<Box2dComponentProps> = ({
  scale,
  workState,
  cursorPosition,
  onSelect,
  selected,
  annotationIndex,
  visible = true,
  annotation,
  dispatch,
}) => {
  const [vertices, setVertices] = useState<BoxLabel>(annotation.label);
  const anchorRadius: number = 5 / scale;
  const strokeWidth: number = 2 / scale;

  const dispatchLabel = (): void => {
    const newAnnotation = { ...annotation };
    newAnnotation.label = vertices;
    dispatch(updateAnnotation(annotationIndex, newAnnotation));
  };

  const onDragAnchor = ({ xi = 'x1', yi = 'y1' }) => (e: KonvaEventObject<DragEvent>): void => {
    const x = Math.round(e.target.position().x);
    const y = Math.round(e.target.position().y);
    // * Round the anchor (circle) position so user can only drag anchor on integer.
    e.target.setAttr('x', x);
    e.target.setAttr('y', y);

    setVertices((prevVertices) => ({ ...prevVertices, [xi]: x, [yi]: y }));
  };

  useEffect(() => {
    setVertices(annotation.label);
  }, [annotation.label]);

  useEffect(() => {
    if (workState === WorkState.Creating && selected) {
      setVertices((prev) => ({ ...prev, x2: cursorPosition.x, y2: cursorPosition.y }));
    }
  }, [workState, selected, cursorPosition, setVertices]);

  return (
    <Group
      visible={visible}
      onMouseDown={(e): void => {
        onSelect(annotationIndex);
        e.cancelBubble = true;
      }}
    >
      <Line
        points={[
          vertices.x1,
          vertices.y1,
          vertices.x2,
          vertices.y1,
          vertices.x2,
          vertices.y2,
          vertices.x1,
          vertices.y2,
          vertices.x1,
          vertices.y1,
        ]}
        stroke="red"
        strokeWidth={strokeWidth}
        closed={true}
      />
      <Group visible={selected}>
        <Circle
          key={'anchor-0'}
          name={'anchor-0'}
          x={vertices.x1}
          y={vertices.y1}
          radius={anchorRadius}
          fill="red"
          draggable={true}
          onDragMove={onDragAnchor({ xi: 'x1', yi: 'y1' })}
          onDragEnd={dispatchLabel}
        />
        <Circle
          key={'anchor-1'}
          name={'anchor-1'}
          x={vertices.x2}
          y={vertices.y1}
          radius={anchorRadius}
          fill="red"
          draggable={true}
          onDragMove={onDragAnchor({ xi: 'x2', yi: 'y1' })}
          onDragEnd={dispatchLabel}
        />
        <Circle
          key={'anchor-2'}
          name={'anchor-2'}
          x={vertices.x2}
          y={vertices.y2}
          radius={anchorRadius}
          fill="red"
          draggable={true}
          onDragMove={onDragAnchor({ xi: 'x2', yi: 'y2' })}
          onDragEnd={dispatchLabel}
        />
        <Circle
          key={'anchor-3'}
          name={'anchor-3'}
          x={vertices.x1}
          y={vertices.y2}
          radius={anchorRadius}
          fill="red"
          draggable={true}
          onDragMove={onDragAnchor({ xi: 'x1', yi: 'y2' })}
          onDragEnd={dispatchLabel}
        />
      </Group>
    </Group>
  );
};

import React, { useState, useEffect, FC, useCallback } from 'react';
import { Line, Group, Circle } from 'react-konva';
import { KonvaEventObject } from 'konva/types/Node';

import {
  BoxLabel,
  Box2dComponentProps,
  WorkState,
  LabelingCursorStates,
} from '../../store/labelingPage/labelingPageTypes';
import { updateAnnotation } from '../../store/labelingPage/labelingPageActions';

export const Box2d: FC<Box2dComponentProps> = ({
  display = false,
  scale,
  workState,
  cursorPosition,
  onSelect,
  selected,
  annotationIndex,
  visible = true,
  annotation,
  dispatch,
  changeCursorState = null,
}) => {
  const [vertices, setVertices] = useState<BoxLabel>(annotation.label);
  const anchorRadius: number = (display ? 10 : 5) / scale;
  const strokeWidth: number = (display ? 4 : 2) / scale;

  const dispatchLabel = (): void => {
    if (display) return;
    changeCursorState();

    if (!dispatch) return;
    const newAnnotation = { ...annotation };
    newAnnotation.label = vertices;
    dispatch(updateAnnotation(annotationIndex, newAnnotation));
  };

  const onDragAnchor = useCallback(
    ({ xi = 'x1', yi = 'y1' }) => (e: KonvaEventObject<DragEvent>): void => {
      if (display) return;
      const stage = e.target.getStage();
      const { width, height } = stage.getSize();
      let x = Math.round(e.target.position().x);
      let y = Math.round(e.target.position().y);

      if (x < 0) x = 0;
      if (y < 0) y = 0;
      if (x > width / scale) x = width / scale;
      if (y > height / scale) y = height / scale;
      // * Round the anchor (circle) position so user can only drag anchor on integer.
      e.target.setAttr('x', x);
      e.target.setAttr('y', y);

      const anotherPosXArr = ['x1', 'x2'];
      const anotherPosYArr = ['y1', 'y2'];
      anotherPosXArr.splice(
        anotherPosXArr.findIndex((xx) => xx === xi),
        1,
      );
      anotherPosYArr.splice(
        anotherPosYArr.findIndex((yy) => yy === yi),
        1,
      );
      if (vertices[anotherPosXArr[0]] > vertices[xi]) {
        if (vertices[anotherPosYArr[0]] > vertices[yi]) {
          changeCursorState(LabelingCursorStates.nwseResize);
        } else {
          changeCursorState(LabelingCursorStates.neswResize);
        }
      } else if (vertices[anotherPosYArr[0]] > vertices[yi]) {
        changeCursorState(LabelingCursorStates.neswResize);
      } else {
        changeCursorState(LabelingCursorStates.nwseResize);
      }

      setVertices((prevVertices) => ({ ...prevVertices, [xi]: x, [yi]: y }));
    },
    [display, changeCursorState, scale, vertices],
  );

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
        if (workState === WorkState.None) {
          onSelect(annotationIndex);
          e.cancelBubble = true;
        }
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
          onMouseEnter={(): void => {
            if (display) return;
            if (workState !== WorkState.Creating) changeCursorState(LabelingCursorStates.nwseResize);
          }}
          onMouseLeave={(): void => {
            if (display) return;
            changeCursorState();
          }}
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
          onMouseEnter={(): void => {
            if (display) return;
            if (workState !== WorkState.Creating) changeCursorState(LabelingCursorStates.neswResize);
          }}
          onMouseLeave={(): void => {
            if (display) return;
            changeCursorState();
          }}
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
          onMouseEnter={(): void => {
            if (display) return;
            if (workState !== WorkState.Creating) changeCursorState(LabelingCursorStates.nwseResize);
          }}
          onMouseLeave={(): void => {
            if (display) return;
            changeCursorState();
          }}
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
          onMouseEnter={(): void => {
            if (display) return;
            if (workState !== WorkState.Creating) changeCursorState(LabelingCursorStates.neswResize);
          }}
          onMouseLeave={(): void => {
            if (display) return;
            changeCursorState();
          }}
        />
      </Group>
    </Group>
  );
};

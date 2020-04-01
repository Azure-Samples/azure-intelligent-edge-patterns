import React, { useState, useEffect, FC } from 'react';
import { Line, Group, Circle } from 'react-konva';
import { useDispatch } from 'react-redux';
import { Position2D, BoxLabel, Annotation, CreatingState, Box2dComponentProps, BoxObject } from './types';
import { updateAnnotation } from '../../actions/labelingPage';

const Box2d: FC<Box2dComponentProps> = ({
  scale,
  // selected,
  annotationIndex,
  visible = true,
  annotation,
  cursorPosition,
}) => {
  const [vertices, setVertices] = useState<BoxLabel>(annotation.label);
  const anchorRadius: number = 5 / scale;
  const strokeWidth: number = 2 / scale;
  const dispatch = useDispatch();

  const dispatchLabel = (): void => {
    const newAnnotation = { ...annotation };
    newAnnotation.label = vertices;
    dispatch(updateAnnotation(annotationIndex, BoxObj.setVerticesToValidValue(newAnnotation)));
  };

  const onDragAnchor = ({ xi = 'x1', yi = 'y1' }) => (e: any): void => {
    const x = Math.round(e.target.position().x);
    const y = Math.round(e.target.position().y);

    // Round the anchor(circle) position so user can only drag anchor on interger.
    // e.target.setAttr('x', x);
    // e.target.setAttr('y', y);

    setVertices((prevVertices) => ({ ...prevVertices, [xi]: x, [yi]: y }));
  };

  useEffect(() => {
    setVertices(annotation.label);
  }, [annotation]);

  return (
    <Group visible={visible}>
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
  );
};

export const BoxObj: BoxObject = {
  init(): Annotation {
    return {
      label: { x1: 0, y1: 0, x2: 0, y2: 0 },
      attribute: '',
      creatingState: CreatingState.Empty,
    };
  },
  createWithPoint(p: Position2D, attribute) {
    const obj = {
      ...this.init(),
      attribute,
    };
    return this.add(p, obj);
  },
  add({ x, y }, obj) {
    // make the original object immutable, for future history usage
    const newObj = { ...obj };

    if (obj.creatingState === CreatingState.Empty) {
      newObj.label.x1 = x;
      newObj.label.y1 = y;
      newObj.label.x2 = x; // initialize x2 y2
      newObj.label.y2 = y;
      newObj.creatingState = CreatingState.P1Added;
    } else if (obj.creatingState === CreatingState.P1Added) {
      if (Math.round(x) === obj.label.x1 || Math.round(y) === obj.label.y1) {
        alert('Can not draw a line/point');
      } else {
        newObj.label.x2 = x;
        newObj.label.y2 = y;
        newObj.creatingState = CreatingState.Finish;
      }
    }

    return this.setVerticesToValidValue(newObj);
  },
  setVerticesToInt(obj: Annotation): Annotation {
    const newObj = { ...obj };
    const { x1, y1, x2, y2 } = newObj.label;
    newObj.label = {
      x1: Math.round(x1),
      y1: Math.round(y1),
      x2: Math.round(x2),
      y2: Math.round(y2),
    };
    return newObj;
  },
  setVerticesPointsOrder(obj: Annotation): Annotation {
    const newObj = { ...obj };
    const { x1, y1, x2, y2 } = newObj.label;
    if (x1 > x2) {
      newObj.label.x1 = x2;
      newObj.label.x2 = x1;
    }
    if (x1 === x2) {
      newObj.label.x2 = x2 + 1;
      if (!obj.creatingState) alert('Cannot create a line/point');
    }
    if (y1 > y2) {
      newObj.label.y1 = y2;
      newObj.label.y2 = y1;
    }
    if (y1 === y2) {
      newObj.label.y2 = y2 + 1;
      if (!obj.creatingState) alert('Cannot create a line/point');
    }
    return newObj;
  },
  setVerticesToValidValue(object: Annotation): Annotation {
    return this.setVerticesPointsOrder(this.setVerticesToInt(object));
  },
  // setFinished(obj: Annotation): Annotation {
  //   if (obj.state === AnnotationState.Created) return;

  //   const newObj = R.clone(obj);
  //   newObj.state = AnnotationState.Created;
  //   newObj.creatingState = undefined;

  //   return newObj;
  // },
  // setStateCreated(idx: number, annotations: Annotation[]): Annotation[] {
  //   const { creatingState } = annotations[idx];

  //   if (creatingState === 'addedX2Y2') return R.update(idx, this.setFinished, annotations);
  //   if (creatingState === 'addedX1Y1') return R.remove(idx, 1, annotations);
  //   return R.clone(annotations);
  // },
  component: Box2d,
};

import Konva from 'konva';
import { KonvaEventObject } from 'konva/types/Node';
import React, { useRef, useState } from 'react';
import { Circle, Group, Line, Path, Text } from 'react-konva';
import { BoxLabel } from '../../store/type';
import { CreatingState } from '../../store/videoAnnoSlice';

type Box = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

type BoxProps = {
  box: Box;
  onBoxChange: (changes: Partial<BoxLabel>) => void;
  boundary: { x1: number; y1: number; x2: number; y2: number };
  visible: boolean;
  removeBox: (id: string) => void;
  creatingState: CreatingState;
  color;
  orderIdx?: number;
};

export const Box: React.FC<BoxProps> = ({
  box,
  onBoxChange,
  visible,
  boundary,
  removeBox,
  creatingState,
  color,
  orderIdx = 0,
}) => {
  const { x1, y1, x2, y2 } = box;
  const [cancelBtnVisible, setCancelBtnVisible] = useState(false);
  const groupRef = useRef<Konva.Group>(null);

  const handleDrag = (e: KonvaEventObject<DragEvent>): void => {
    let { x, y } = e.target.position();

    if (x < boundary.x1) {
      x = boundary.x1;
      // Set the target(should be the dragging circle) to the boundary
      e.target.x(x);
    }

    if (x > boundary.x2) {
      x = boundary.x2;
      e.target.x(x);
    }

    if (y < boundary.y1) {
      y = boundary.y1;
      e.target.y(y);
    }

    if (y > boundary.y2) {
      y = boundary.y2;
      e.target.y(y);
    }

    switch (e.target.name()) {
      case 'leftTop':
        onBoxChange({ x1: x, y1: y });
        break;
      case 'rightTop':
        onBoxChange({ x2: x, y1: y });
        break;
      case 'rightBottom':
        onBoxChange({ x2: x, y2: y });
        break;
      case 'leftBottom':
        onBoxChange({ x1: x, y2: y });
        break;
      default:
        break;
    }
  };

  const scale = groupRef.current?.getLayer().scale().x || 1;

  const radius = 5 / scale;

  return (
    <Group
      visible={visible}
      onMouseEnter={(): void => setCancelBtnVisible(true)}
      onMouseLeave={(): void => setCancelBtnVisible(false)}
      cache={[{ drawBorder: true }]}
      ref={groupRef}
    >
      <Line
        x={x1}
        y={y1}
        points={[0, 0, 0, y2 - y1, x2 - x1, y2 - y1, x2 - x1, 0]}
        closed
        stroke={color}
        strokeWidth={2 / scale}
        hitStrokeWidth={50 / scale}
      />
      <Circle draggable name="leftTop" x={x1} y={y1} radius={radius} fill={color} onDragMove={handleDrag} />
      <Circle draggable name="rightTop" x={x2} y={y1} radius={radius} fill={color} onDragMove={handleDrag} />
      <Circle
        draggable
        name="rightBottom"
        x={x2}
        y={y2}
        radius={radius}
        fill={color}
        onDragMove={handleDrag}
      />
      <Circle
        draggable
        name="leftBottom"
        x={x1}
        y={y2}
        radius={radius}
        fill={color}
        onDragMove={handleDrag}
      />
      <Path
        x={x1}
        y={y1 - 30 / scale}
        data="M 0 0 L 20 20 M 20 0 L 0 20"
        stroke="red"
        strokeWidth={5}
        visible={cancelBtnVisible && creatingState === CreatingState.Disabled}
        onMouseEnter={(e): void => {
          e.target.getStage().container().style.cursor = 'pointer';
        }}
        onMouseLeave={(e): void => {
          e.target.getStage().container().style.cursor = 'default';
        }}
        onClick={(): void => removeBox(box.id)}
        scale={{ x: 1 / scale, y: 1 / scale }}
      />
      <Text
        x={x2}
        y={y1}
        text={orderIdx && orderIdx.toString()}
        fontSize={30}
        fill={color}
        strokeWidth={3}
        visible={!!orderIdx}
        scale={{ x: 1 / scale, y: 1 / scale }}
      />
    </Group>
  );
};

import Konva from 'konva';
import { KonvaEventObject } from 'konva/types/Node';
import React, { useMemo, useRef, useState } from 'react';
import { Group, Line, Circle, Path, Text } from 'react-konva';
import { PolygonLabel } from '../../store/type';
import { CreatingState } from '../../store/videoAnnoSlice';

type PolygonProps = {
  polygon: PolygonLabel;
  visible: boolean;
  removePolygon: () => void;
  creatingState: CreatingState;
  handleChange: (idx: number, vertex) => void;
  boundary: { x1: number; y1: number; x2: number; y2: number };
  color: string;
  orderIdx?: number;
};

export const Polygon: React.FC<PolygonProps> = ({
  polygon,
  visible,
  removePolygon,
  creatingState,
  handleChange,
  boundary,
  color,
  orderIdx = 0,
}) => {
  const [cancelBtnVisible, setCanceBtnVisible] = useState(false);
  const groupRef = useRef<Konva.Group>(null);

  const scale = groupRef.current?.getLayer().scale().x || 1;

  const radius = 5 / scale;

  const borderPoints = useMemo(() => {
    return polygon
      .map((e, _, arr) => {
        return { x: e.x - arr[0].x, y: e.y - arr[0].y };
      })
      .reduce((acc, cur) => {
        acc.push(cur.x, cur.y);
        return acc;
      }, []);
  }, [polygon]);

  const onDragMove = (idx: number) => (e: KonvaEventObject<DragEvent>): void => {
    let { x, y } = e.target.position();

    if (x < boundary.x1) {
      x = boundary.x1;
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

    handleChange(idx, { x, y });
  };

  const topPoint = useMemo(() => {
    let point = { x: null, y: Infinity };
    polygon.forEach((e) => {
      if (e.y < point.y) point = e;
    });
    return point;
  }, [polygon]);

  return (
    <Group
      visible={visible}
      onMouseEnter={(): void => setCanceBtnVisible(true)}
      onMouseLeave={(): void => setCanceBtnVisible(false)}
      cache={[{ drawBorder: true }]}
      ref={groupRef}
    >
      <Line
        x={polygon[0].x}
        y={polygon[0].y}
        points={borderPoints}
        closed
        stroke={color}
        strokeWidth={2 / scale}
        hitStrokeWidth={50 / scale}
      />
      {polygon.map((e, i) => (
        <Circle
          key={i}
          draggable
          name="leftTop"
          x={e.x}
          y={e.y}
          radius={radius}
          fill={color}
          onDragMove={onDragMove(i)}
          hitStrokeWidth={50 / scale}
        />
      ))}
      <Path
        x={topPoint.x}
        y={topPoint.y - 30 / scale}
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
        onClick={(): void => removePolygon()}
        scale={{ x: 1 / scale, y: 1 / scale }}
      />
      <Text
        x={polygon[1].x + 5 / scale}
        y={polygon[1].y - 20 / scale}
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

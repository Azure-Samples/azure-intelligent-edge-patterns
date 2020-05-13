import React, { FC, memo, Dispatch, useState, useEffect } from 'react';
import { Group, Line, Rect } from 'react-konva';

import { Size2D, LabelingCursorStates, BoxLabel } from '../../store/labelingPage/labelingPageTypes';

interface RemoveBoxButtonProps {
  visible: boolean;
  imageSize: Size2D;
  label: BoxLabel;
  changeCursorState: (cursorType?: LabelingCursorStates) => void;
  scale: number;
  setShowOuterRemoveButton: Dispatch<boolean>;
  removeBox: () => void;
}
const RemoveBoxButton: FC<RemoveBoxButtonProps> = ({
  visible,
  imageSize,
  label,
  changeCursorState,
  scale,
  setShowOuterRemoveButton,
  removeBox,
}) => {
  const [color, setColor] = useState<string>('#F9526B');
  const [strokeWidth, setStrokeWidth] = useState<number>(1.5 / scale);
  let x: number;
  let y: number;

  if (label.x1 > 30 / scale || label.x2 < (imageSize.width - 25) / scale) {
    if (label.x1 > 30 / scale) x = label.x1 - 20 / scale;
    else x = label.x2 + 25 / scale;

    if (label.y1 > 12 / scale) {
      y = label.y1 - 10 / scale;
    } else {
      y = label.y1 + 12 / scale;
    }
  } else {
    x = 12 / scale;
    if (label.y1 > 20 / scale) {
      y = label.y1 - 20 / scale;
    } else {
      // * Make remove button disappear
      y = -60;
    }
  }
  if (y === -60) setShowOuterRemoveButton(true);
  else setShowOuterRemoveButton(false);

  useEffect(() => {
    setStrokeWidth(1.5 / scale);
  }, [scale]);

  return (
    <Group
      visible={visible}
      x={x}
      y={y}
      onMouseEnter={(): void => {
        changeCursorState(LabelingCursorStates.pointer);
        setColor('#E73550');
        setStrokeWidth(3 / scale);
      }}
      onMouseLeave={(): void => {
        changeCursorState();
        setColor('#F9526B');
        setStrokeWidth(1.5 / scale);
      }}
      onClick={(e): void => {
        removeBox();
        e.cancelBubble = true;
      }}
    >
      <Rect x={-5 / scale} y={-5 / scale} width={10 / scale} height={10 / scale} />
      <Line
        points={[-5 / scale, -5 / scale, 5 / scale, 5 / scale]}
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Line
        points={[5 / scale, -5 / scale, -5 / scale, 5 / scale]}
        stroke={color}
        strokeWidth={strokeWidth}
      />
    </Group>
  );
};

export default memo(RemoveBoxButton);

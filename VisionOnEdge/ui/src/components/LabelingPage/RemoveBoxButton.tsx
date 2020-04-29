import React, { FC, memo, Dispatch, useState } from 'react';
import { Group, Line, Rect } from 'react-konva';

import { Size2D, LabelingCursorStates, BoxLabel } from '../../store/labelingPage/labelingPageTypes';

interface RemoveBoxButtonProps {
  visible: boolean;
  imageSize: Size2D;
  label: BoxLabel;
  changeCursorState: (cursorType?: LabelingCursorStates) => void;
  scale: number;
  setShowOuterRemoveButton: Dispatch<boolean>;
}
const RemoveBoxButton: FC<RemoveBoxButtonProps> = ({
  visible,
  imageSize,
  label,
  changeCursorState,
  scale,
  setShowOuterRemoveButton,
}) => {
  const [color, setColor] = useState<string>('#F9526B');
  let x: number;
  let y: number;

  if (label.x1 > 60 || label.x2 < imageSize.width / scale - 50) {
    if (label.x1 > 60) x = label.x1 - 50;
    else x = label.x2 + 50;

    if (label.y1 > 20) {
      y = label.y1 - 20;
    } else {
      y = label.y1 + 12;
    }
  } else {
    x = 12;
    if (label.y1 > 40) {
      y = label.y1 - 40;
    } else {
      // * Make remove button disappear
      y = -60;
    }
  }
  if (y === -60) setShowOuterRemoveButton(true);
  else setShowOuterRemoveButton(false);

  return (
    <Group
      visible={visible}
      x={x}
      y={y}
      onMouseEnter={(): void => {
        changeCursorState(LabelingCursorStates.pointer);
        setColor('#E73550');
      }}
      onMouseLeave={(): void => {
        changeCursorState();
        setColor('#F9526B');
      }}
    >
      <Rect x={-10} y={-10} width={20} height={20} />
      <Line points={[-10, -10, 10, 10]} stroke={color} />
      <Line points={[10, -10, -10, 10]} stroke={color} />
    </Group>
  );
};

export default memo(RemoveBoxButton);

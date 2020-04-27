import React, { useState, useRef, useEffect, FC, useMemo } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import { Flex, Text } from '@fluentui/react-northstar';

import useImage from './LabelingPage/util/useImage';
import { Position2D, Size2D, WorkState, AnnotationState } from '../store/labelingPage/labelingPageTypes';
import { LabelImage } from '../store/part/partTypes';
import { Box2d } from './LabelingPage/Box';

interface LabelDisplayImageProps {
  labelImage: LabelImage;
  labelText?: string;
  width: number;
  height?: number;
  pointerCursor?: boolean;
  onClick?: (event: any) => void;
}
const LabelDisplayImage: FC<LabelDisplayImageProps> = ({
  labelImage,
  labelText = '',
  width = 300,
  height = 150,
  pointerCursor = false,
  onClick,
}) => {
  const [image, _, size] = useImage(labelImage.image, 'anonymous');
  const [imageSize, setImageSize] = useState<Size2D>({ width, height });
  const scale = useRef<Position2D>({ x: 1, y: 1 });

  const annotations = useMemo(() => {
    if (!labelImage?.labels) return [];

    return JSON.parse(labelImage.labels).map((parsedLabels) => ({
      label: parsedLabels,
      attribute: '',
      annotationState: AnnotationState.Finish,
    }));
  }, [labelImage]);

  useEffect(() => {
    if (size.width !== 0) {
      const scaleX = imageSize.width / size.width;
      if (scaleX !== scale.current.x) {
        scale.current = { x: scaleX, y: scaleX };
        setImageSize((prev) => ({ ...prev, height: size.height * scaleX }));
      }
    }
  }, [imageSize, size]);

  return (
    <div onClick={onClick} style={{ cursor: pointerCursor ? 'pointer' : 'default' }}>
      <Flex column>
        <Stage width={imageSize.width} height={imageSize.height} scale={scale.current}>
          <Layer>
            <KonvaImage image={image} />
            {annotations.map((annotation, i) => (
              <Box2d
                key={i}
                display={true}
                workState={WorkState.None}
                cursorPosition={{ x: 0, y: 0 }}
                onSelect={(): void => void 0}
                annotation={annotation}
                scale={1}
                annotationIndex={i}
                selected={annotations.length === 1}
                dispatch={null}
              />
            ))}
          </Layer>
        </Stage>
        <Text align="center">{labelText}</Text>
      </Flex>
    </div>
  );
};

export default LabelDisplayImage;

import React, { useState, useRef, useEffect, FC, useMemo } from 'react';
import { Stage, FastLayer, Image as KonvaImage } from 'react-konva';
import { Flex, Text } from '@fluentui/react-northstar';

import useImage from './LabelingPage/util/useImage';
import { Position2D, Size2D, AnnotationState, Annotation } from '../store/labelingPage/labelingPageTypes';
import { DisplayBox } from './LabelingPage/Box';
import { LabelImage } from '../store/image/imageTypes';

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

  const annotations = useMemo<Annotation[]>(() => {
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
          <FastLayer>
            <KonvaImage image={image} />
            {annotations.map((annotation, i) => (
              <DisplayBox key={i} vertices={annotation.label} color="red" />
            ))}
          </FastLayer>
        </Stage>
        <Text align="center">{labelText}</Text>
      </Flex>
    </div>
  );
};

export default LabelDisplayImage;

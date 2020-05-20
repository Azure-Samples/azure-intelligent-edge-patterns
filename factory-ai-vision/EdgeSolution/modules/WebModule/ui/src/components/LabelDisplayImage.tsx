import React, { useState, useRef, useEffect, FC, useMemo, useCallback } from 'react';
import { Stage, FastLayer, Image as KonvaImage } from 'react-konva';
import { Flex, Text } from '@fluentui/react-northstar';

import useImage from './LabelingPage/util/useImage';
import { Size2D, AnnotationState, Annotation } from '../store/labelingPage/labelingPageTypes';
import { DisplayBox } from './LabelingPage/Box';
import { LabelImage } from '../store/image/imageTypes';
import getResizeImageFunction from './LabelingPage/util/resizeImage';

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
  const resizeImage = useCallback(getResizeImageFunction({ width, height }), [width, height]);
  const scale = useRef<number>(1);

  const annotations = useMemo<Annotation[]>(() => {
    if (!labelImage?.labels) return [];

    return JSON.parse(labelImage.labels).map((parsedLabels) => ({
      label: parsedLabels,
      attribute: '',
      annotationState: AnnotationState.Finish,
    }));
  }, [labelImage]);

  useEffect(() => {
    const [outcomeSize, outcomeScale] = resizeImage(size);
    setImageSize(outcomeSize);

    scale.current = outcomeScale;
  }, [size, resizeImage]);

  return (
    <div onClick={onClick} style={{ cursor: pointerCursor ? 'pointer' : 'default' }}>
      <Flex column>
        <Stage
          width={imageSize.width}
          height={imageSize.height}
          scale={{ x: scale.current, y: scale.current }}
        >
          <FastLayer>
            <KonvaImage image={image} />
            {annotations.map((annotation, i) => (
              <DisplayBox key={i} scale={scale.current} vertices={annotation.label} color="red" />
            ))}
          </FastLayer>
        </Stage>
        <Text align="center">{labelText}</Text>
      </Flex>
    </div>
  );
};

export default LabelDisplayImage;

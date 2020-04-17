import React, { useState, useRef, useEffect, FC } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import { Flex, Text } from '@fluentui/react-northstar';

import useImage from './LabelingPage/util/useImage';
import { Position2D, Size2D } from '../store/labelingPage/labelingPageTypes';

interface ImageLinkProps {
  imgSrc?: string;
  label?: string;
  imgPadding?: string;
  width: number;
  height?: number;
  pointerCursor?: boolean;
  onClick?: (event: any) => void;
}
const ImageLink: FC<ImageLinkProps> = ({
  imgSrc,
  label = '',
  imgPadding = '10px',
  width = 300,
  height = 150,
  pointerCursor = false,
  onClick,
}) => {
  const [image, status, size] = useImage(imgSrc.replace('8000', '3000'), 'anonymous');
  const [imageSize, setImageSize] = useState<Size2D>({ width, height });
  const scale = useRef<Position2D>({ x: 1, y: 1 });

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
          </Layer>
        </Stage>
        <Text align="center">{label}</Text>
      </Flex>
    </div>
  );
};

export default ImageLink;

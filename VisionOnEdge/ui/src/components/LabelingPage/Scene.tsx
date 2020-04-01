import React, { FC, useState, useEffect } from 'react';
import { Text } from '@fluentui/react-northstar';
import { Stage, Layer, Image } from 'react-konva';

import useImage from './util/useImage';
import { BoxObj } from './Box';
import { Size2D, Annotation } from './types';

enum LabelingState {
  Creating = 'Creating',
  Selecting = 'Selecting',
  None = 'None',
}

interface SceneProps {
  url?: string;
}
const Scene: FC<SceneProps> = ({ url = '' }) => {
  const [image, status, size] = useImage(url, 'anonymous');
  const [imageSize, setImageSize] = useState<Size2D>({ width: 0, height: 0 });
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [labelingState, setLabelingState] = useState<LabelingState>(LabelingState.Creating);

  useEffect(() => {
    setImageSize(size);
  }, [size]);

  if (imageSize.height === 0 && imageSize.width === 0) return <Text color="red">Loading...</Text>;

  return (
    <Stage width={imageSize.width} height={imageSize.height}>
      <Layer>
        <Image image={image} />
        {annotations.map((annotation, i) => (
          <BoxObj.component
            key={i}
            annotation={annotation}
            cursorPosition={{ x: 0, y: 0 }}
            scale={1}
            annotationIndex={i}
          />
        ))}
      </Layer>
    </Stage>
  );
};

export default Scene;

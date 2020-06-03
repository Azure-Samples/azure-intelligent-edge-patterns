import React, { useEffect, useMemo, useCallback, memo, MouseEvent, FC, useRef } from 'react';
import Konva from 'konva';
import { Text } from '@fluentui/react-northstar';

import useImage from './LabelingPage/util/useImage';
import { AnnotationState, Annotation } from '../store/labelingPage/labelingPageTypes';
import { LabelImage } from '../store/image/imageTypes';
import getResizeImageFunction from './LabelingPage/util/resizeImage';

interface LabelDisplayImageProps {
  labelImage: LabelImage;
  labelText?: string;
  width: number;
  height?: number;
  pointerCursor?: boolean;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
}
const LabelDisplayImage: FC<LabelDisplayImageProps> = ({
  labelImage,
  labelText = '',
  width = 300,
  height = 150,
  pointerCursor = false,
  onClick,
}) => {
  const stage = useRef<Konva.Stage>(null);
  const layer = useRef<Konva.FastLayer>(null);
  const img = useRef<Konva.Image>(null);
  const imgScale = useRef<number>(1);
  const shapes = useRef<BoxShape[]>([]);
  const [image, , size] = useImage(labelImage.image, 'anonymous');
  const resizeImage = useCallback(getResizeImageFunction({ width, height }), [width, height]);

  const annotations = useMemo<Annotation[]>(() => {
    if (!labelImage?.labels) return [];

    return JSON.parse(labelImage.labels).map((parsedLabels, i) => ({
      id: i,
      label: parsedLabels,
      attribute: '',
      annotationState: AnnotationState.Finish,
    }));
  }, [labelImage]);

  useEffect(() => {
    const [outcomeSize, outcomeScale] = resizeImage(size);
    imgScale.current = outcomeScale;
    stage.current = new Konva.Stage({
      height: outcomeSize.height,
      width: outcomeSize.width,
      scale: { x: outcomeScale, y: outcomeScale },
      container: `display-${labelImage.id}`,
    });

    layer.current = new Konva.FastLayer();

    img.current = new Konva.Image({ image });
    layer.current.add(img.current);
    stage.current.add(layer.current);

    return (): void => {
      stage.current.destroy();
      layer.current.destroy();
    };
  }, [size, image, resizeImage, labelImage.id]);

  useEffect(() => {
    const newShapes = annotations.map((e) => annotationToShape(e, imgScale.current));

    for (let i = 0; i < shapes.current.length; i++) {
      shapes.current[i].edge.destroy();

      shapes.current[i].points.forEach((e) => e.destroy());
    }
    shapes.current = newShapes;
    for (let i = 0; i < newShapes.length; i++) {
      const { points, edge } = newShapes[i];
      layer.current.add(edge);

      for (let j = 0; j < points.length; j++) {
        layer.current.add(points[j]);
      }
    }
    stage.current.draw();
  }, [annotations]);

  return (
    <div
      onClick={onClick}
      style={{
        cursor: pointerCursor ? 'pointer' : 'default',
        display: 'flex',
        flexFlow: 'column',
      }}
    >
      <div id={`display-${labelImage.id}`} />
      <Text align="center">{labelText}</Text>
    </div>
  );
};

type BoxShape = {
  id: number;
  edge: Konva.Line;
  points: Konva.Circle[];
};
const annotationToShape = (annotation: Annotation, imgScale: number): BoxShape => {
  const { id, label } = annotation;
  const edge = new Konva.Line({
    points: [
      label.x1,
      label.y1,
      label.x2,
      label.y1,
      label.x2,
      label.y2,
      label.x1,
      label.y2,
      label.x1,
      label.y1,
    ],
    stroke: 'red',
    strokeWidth: 1 / imgScale,
    closed: true,
  });

  const points = [];

  points.push(new Konva.Circle({ x: label.x1, y: label.y1, radius: 3 / imgScale, fill: 'red' }));
  points.push(new Konva.Circle({ x: label.x1, y: label.y2, radius: 3 / imgScale, fill: 'red' }));
  points.push(new Konva.Circle({ x: label.x2, y: label.y2, radius: 3 / imgScale, fill: 'red' }));
  points.push(new Konva.Circle({ x: label.x2, y: label.y1, radius: 3 / imgScale, fill: 'red' }));

  return {
    id,
    edge,
    points,
  };
};

export default memo(LabelDisplayImage);

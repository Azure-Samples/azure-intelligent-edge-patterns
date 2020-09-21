import React, { useEffect, useCallback, useLayoutEffect, memo, MouseEvent, FC, useRef } from 'react';
import Konva from 'konva';
import { useSelector } from 'react-redux';

import useImage from './LabelingPage/util/useImage';
import getResizeImageFunction, { CanvasFit } from './LabelingPage/util/resizeImage';
import { Annotation, Size2D } from '../store/type';
import { selectAnnoByImgId } from '../store/annotationSlice';
import { LabelingDisplayImageCard } from './LabelingDisplayImageCard';

interface LabelDisplayImageProps {
  imgId: number;
  imgUrl: string;
  imgTimeStamp: string;
  partName: string;
  isRelabel: boolean;
  pointerCursor?: boolean;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
}
const LabelDisplayImage: FC<LabelDisplayImageProps> = ({
  imgId,
  imgUrl,
  imgTimeStamp,
  partName,
  isRelabel,
  pointerCursor = false,
  onClick,
}) => {
  const stage = useRef<Konva.Stage>(null);
  const layer = useRef<Konva.FastLayer>(null);
  const img = useRef<Konva.Image>(null);

  const imgSize = useRef<Size2D>({ width: 400, height: 300 });
  const imgScale = useRef<number>(1);
  const shapes = useRef<BoxShape[]>([]);
  const [image, , size] = useImage(imgUrl, 'anonymous');
  const resizeImage = useCallback(getResizeImageFunction(imgSize.current, CanvasFit.Cover), [
    imgSize.current,
  ]);
  const annotations = useSelector(selectAnnoByImgId(imgId));

  useLayoutEffect(() => {
    const container: HTMLDivElement = document.querySelector('#container');
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    imgSize.current = { width, height };
  }, []);
  useEffect(() => {
    if (size.width > 0) {
      if (layer.current === null) {
        const [outcomeSize, outcomeScale] = resizeImage(size);
        imgScale.current = outcomeScale;

        stage.current = new Konva.Stage({
          height: outcomeSize.height,
          width: outcomeSize.width,
          scale: { x: outcomeScale, y: outcomeScale },
          container: `display-${imgId}`,
        });

        layer.current = new Konva.FastLayer();

        img.current = new Konva.Image({ image });

        layer.current.add(img.current);
        stage.current.add(layer.current);
      }
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

      layer.current.draw();
    }
  }, [size, image, resizeImage, imgId, annotations]);

  return (
    <LabelingDisplayImageCard
      isRelabel={isRelabel}
      cameraName=""
      imgTimeStamp={imgTimeStamp}
      partName={partName}
    >
      <div
        onClick={onClick}
        id="container"
        style={{
          cursor: pointerCursor ? 'pointer' : 'default',
          height: '200px',
          width: '300px',
        }}
      >
        <div id={`display-${imgId}`} />
      </div>
    </LabelingDisplayImageCard>
  );
};

type BoxShape = {
  id: string;
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

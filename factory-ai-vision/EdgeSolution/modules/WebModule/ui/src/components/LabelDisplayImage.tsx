import React, { useLayoutEffect, memo, MouseEvent, FC, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Image, Layer, Stage } from 'react-konva';

import useImage from './LabelingPage/util/useImage';
import resizeImageFunction, { CanvasFit } from './LabelingPage/util/resizeImage';
import { Size2D } from '../store/type';
import { imgAnnoSelectorFactory } from '../store/annotationSlice';
import { LabelingDisplayImageCard } from './LabelingDisplayImageCard';
import { Box2d } from './LabelingPage/Box';
import { WorkState } from './LabelingPage/type';

interface LabelDisplayImageProps {
  imgId: number;
  imgUrl: string;
  imgTimeStamp: string;
  cameraName: string;
  partName: string;
  manualChecked: boolean;
  pointerCursor?: boolean;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;

  parts: string[];
}
const LabelDisplayImage: FC<LabelDisplayImageProps> = ({
  imgId,
  imgUrl,
  imgTimeStamp,
  cameraName,
  partName,
  manualChecked,
  pointerCursor = false,
  onClick,
  parts,
}) => {
  const imgSize = useRef<Size2D>({ width: 400, height: 300 });
  const imgScale = useRef<number>(1);
  const [image, , size] = useImage(imgUrl, 'anonymous');
  const imgAnnoSelector = useMemo(() => imgAnnoSelectorFactory(imgId), [imgId]);
  const annotations = useSelector(imgAnnoSelector);

  useLayoutEffect(() => {
    const container: HTMLDivElement = document.querySelector('#container');
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    imgSize.current = { width, height };
  }, []);

  const [outcomeSize, outcomeScale] = resizeImageFunction(imgSize.current, CanvasFit.Cover, size);

  return (
    <LabelingDisplayImageCard
      manualChecked={manualChecked}
      cameraName={cameraName}
      imgTimeStamp={imgTimeStamp}
      partName={partName}
      parts={parts}
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
        <Stage
          height={outcomeSize.height}
          width={outcomeSize.width}
          scale={{ x: outcomeScale, y: outcomeScale }}
        >
          <Layer>
            <Image image={image} />
            {annotations.map((e, i) => (
              <Box2d
                key={e.id}
                scale={imgScale.current}
                workState={WorkState.None}
                annotationIndex={i}
                annotation={e}
                draggable={false}
                color="red"
                selected={false}
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </LabelingDisplayImageCard>
  );
};

export default memo(LabelDisplayImage);

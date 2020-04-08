import React, { FC, useState, useEffect } from 'react';
import { Text, Button } from '@fluentui/react-northstar';
import { Stage, Layer, Image } from 'react-konva';
import { KonvaEventObject } from 'konva/types/Node';
import { useSelector, useDispatch } from 'react-redux';

import useImage from './util/useImage';
import { Box2d } from './Box';
import { Size2D, Annotation, Position2D, WorkState } from './types';
import { State } from '../../State';
import {
  createAnnotation,
  updateCreatingAnnotation,
  removeAnnotation,
} from '../../actions/labelingPage';

interface SceneProps {
  url?: string;
}
const Scene: FC<SceneProps> = ({ url = '' }) => {
  const annotations = useSelector<State, Annotation[]>((state) => state.labelingPageState.annotations);
  const [imageSize, setImageSize] = useState<Size2D>({ width: 1000, height: 300 });
  const [image, status, size] = useImage(url.replace('8000', '3000'), 'anonymous');
  const [selectedAnnotationIndex, setSelectedAnnotationIndex] = useState<number>(null);
  const [workState, setWorkState] = useState<WorkState>(WorkState.None);
  const [cursorPosition, setCursorPosition] = useState<Position2D>({ x: 0, y: 0 });
  // const stageRef = useRef(null);
  // const layerRef = useRef(null);
  const dispatch = useDispatch();

  // const getCursorPosition = (stage, layer): Position2D => {
  //   if (stage === null && layer === null) throw new Error('Stage & layer refering failed');
  //   const { x, y } = layer
  //     .getTransform()
  //     .copy()
  //     .invert()
  //     .point(stage.getPointerPosition());

  //   const cursorPos = { x: Math.round(x), y: Math.round(y) };

  //   if (x <= 0) cursorPos.x = 0;
  //   if (x >= imageSize.width) cursorPos.x = imageSize.width;
  //   if (y <= 0) cursorPos.y = 0;
  //   if (y >= imageSize.height) cursorPos.y = imageSize.height;

  //   return cursorPos;
  // };

  const onMouseDown = (): void => {
    if (selectedAnnotationIndex !== null && workState === WorkState.None) {
      setSelectedAnnotationIndex(null);
    } else {
      dispatch(createAnnotation(cursorPosition));
      setSelectedAnnotationIndex(annotations.length - 1);
      setWorkState(WorkState.Creating);
    }
  };

  const onMouseUp = (): void => {
    if (workState === WorkState.Creating) {
      dispatch(updateCreatingAnnotation(cursorPosition));
      // dispatch(finishCreatingAnnotation());
      if (annotations.length - 1 === selectedAnnotationIndex) {
        setWorkState(WorkState.Selecting);
      } else {
        setWorkState(WorkState.None);
        setSelectedAnnotationIndex(null);
      }
    }
  };

  const onSelect = (index: number): void => {
    setSelectedAnnotationIndex(index);
    setWorkState(WorkState.Selecting);
  };

  useEffect(() => {
    if (workState === WorkState.None) setSelectedAnnotationIndex(null);
  }, [workState]);
  useEffect(() => {
    setImageSize(size);
  }, [size]);

  if (imageSize.height === 0 && imageSize.width === 0) return <Text color="red">Loading...</Text>;

  return (
    <div style={{ margin: 3 }}>
      <Stage
        // ref={stageRef}
        width={imageSize.width}
        height={imageSize.height}
      >
        <Layer
          // ref={layerRef}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseMove={(e: KonvaEventObject<MouseEvent>): void => {
            setCursorPosition({ x: e.evt.offsetX, y: e.evt.offsetY });
          }}
        >
          <Image image={image} />
          {annotations.map((annotation, i) => (
            <Box2d
              key={i}
              workState={workState}
              cursorPosition={cursorPosition}
              onSelect={onSelect}
              annotation={annotation}
              scale={1}
              annotationIndex={i}
              selected={i === selectedAnnotationIndex}
              dispatch={dispatch}
            />
          ))}
        </Layer>
      </Stage>
      <Button
        content={selectedAnnotationIndex === null ? 'Clear' : 'Remove'}
        onClick={(): void => {
          dispatch(removeAnnotation(selectedAnnotationIndex));
          setSelectedAnnotationIndex(null);
        }}
      />
    </div>
  );
};

export default Scene;

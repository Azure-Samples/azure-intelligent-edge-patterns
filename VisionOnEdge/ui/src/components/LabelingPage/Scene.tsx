import React, { FC, useState, useEffect, useRef } from 'react';
import { Text, Button } from '@fluentui/react-northstar';
import { Stage, Layer, Image } from 'react-konva';
import { useSelector, useDispatch } from 'react-redux';

import useImage from './util/useImage';
import { Box2d } from './Box';
import { Size2D, Annotation, Position2D, WorkState } from './types';
import { State } from '../../State';
import {
  createAnnotation,
  updateCreatingAnnotation,
  finishCreatingAnnotation,
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
  const stageRef = useRef(null);
  const layerRef = useRef(null);
  const dispatch = useDispatch();

  const getCursorPosition = (stage, layer): Position2D => {
    if (stage === null && layer === null) throw new Error('Stage & layer refering failed');
    const { x, y } = layer.getTransform().copy().invert().point(stage.getPointerPosition());

    const cursorPos = { x: Math.round(x), y: Math.round(y) };

    if (x <= 0) cursorPos.x = 0;
    if (x >= imageSize.width) cursorPos.x = imageSize.width;
    if (y <= 0) cursorPos.y = 0;
    if (y >= imageSize.height) cursorPos.y = imageSize.height;

    return cursorPos;
  };

  const onMouseDown = (): void => {
    if (workState === WorkState.None) {
      const pos = getCursorPosition(stageRef.current, layerRef.current);
      dispatch(createAnnotation(pos));
      setWorkState(WorkState.Creating);
    } else if (workState === WorkState.Selecting) {
      setWorkState(WorkState.None);
    }
  };

  const onMouseMove = (): void => {
    if (workState === WorkState.Creating) {
      const pos = getCursorPosition(stageRef.current, layerRef.current);
      dispatch(updateCreatingAnnotation(pos));
    }
  };

  const onMouseUp = (): void => {
    if (workState === WorkState.Creating) {
      dispatch(finishCreatingAnnotation());
      setWorkState(WorkState.None);
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
        ref={stageRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        width={imageSize.width}
        height={imageSize.height}
      >
        <Layer ref={layerRef}>
          <Image
            image={image}
            onClick={(): void => {
              setSelectedAnnotationIndex(null);
            }}
          />
          {annotations.map((annotation, i) => (
            <Box2d
              key={i}
              annotation={annotation}
              scale={1}
              annotationIndex={i}
              onSelect={onSelect}
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
        }}
      />
    </div>
  );
};

export default Scene;

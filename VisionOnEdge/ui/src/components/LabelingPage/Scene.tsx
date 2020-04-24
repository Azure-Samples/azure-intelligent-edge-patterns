import React, { FC, useState, useEffect, useRef, useMemo } from 'react';
import { Text, Button, CloseIcon } from '@fluentui/react-northstar';
import { Stage, Layer, Image } from 'react-konva';
import { KonvaEventObject } from 'konva/types/Node';
import { useDispatch } from 'react-redux';

import useImage from './util/useImage';
import { Box2d } from './Box';
import {
  Size2D,
  Annotation,
  Position2D,
  WorkState,
  LabelingType,
  LabelingCursorStates,
} from '../../store/labelingPage/labelingPageTypes';
import {
  createAnnotation,
  updateCreatingAnnotation,
  removeAnnotation,
} from '../../store/labelingPage/labelingPageActions';

const defaultSize: Size2D = {
  width: 900,
  height: 600,
};

interface SceneProps {
  url?: string;
  labelingType: LabelingType;
  annotations: Annotation[];
}
const Scene: FC<SceneProps> = ({ url = '', labelingType, annotations }) => {
  const dispatch = useDispatch();
  const [imageSize, setImageSize] = useState<Size2D>(defaultSize);
  const noMoreCreate = useMemo(
    () => labelingType === LabelingType.SingleAnnotation && annotations.length === 1,
    [labelingType, annotations],
  );
  const [cursorState, setCursorState] = useState<LabelingCursorStates>(LabelingCursorStates.default);
  const [image, status, size] = useImage(url.replace('8000', '3000'), 'anonymous');
  const [selectedAnnotationIndex, setSelectedAnnotationIndex] = useState<number>(null);
  const [workState, setWorkState] = useState<WorkState>(WorkState.None);
  const [cursorPosition, setCursorPosition] = useState<Position2D>({ x: 0, y: 0 });
  const scale = useRef<Position2D>({ x: 1, y: 1 });

  const onMouseDown = (): void => {
    // * Single bounding box labeling type condition
    if (noMoreCreate) return;

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
    // * Single bounding box labeling type condition
    if (noMoreCreate) {
      setCursorState(LabelingCursorStates.default);
      setSelectedAnnotationIndex(0);
    } else {
      setCursorState(LabelingCursorStates.crosshair);
    }
  }, [annotations, labelingType, noMoreCreate]);
  useEffect(() => {
    if (workState === WorkState.None) setSelectedAnnotationIndex(null);
  }, [workState]);
  useEffect(() => {
    if (size.width !== 0) {
      const scaleX = defaultSize.width / size.width;
      if (scaleX !== scale.current.x) {
        scale.current = { x: scaleX, y: scaleX };
        setImageSize((prev) => ({ ...prev, height: size.height * scaleX }));
      }
    }
  }, [size]);

  if (status === 'loading' || (imageSize.height === 0 && imageSize.width === 0))
    return (
      <Text align="center" color="red">
        Loading...
      </Text>
    );

  return (
    <div style={{ margin: 3 }}>
      <Stage
        width={imageSize.width}
        height={imageSize.height}
        scale={scale.current}
        style={{ cursor: cursorState }}
      >
        <Layer
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseMove={(e: KonvaEventObject<MouseEvent>): void => {
            setCursorPosition({ x: e.evt.offsetX / scale.current.x, y: e.evt.offsetY / scale.current.y });
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
              scale={scale.current.x}
              annotationIndex={i}
              selected={i === selectedAnnotationIndex}
              dispatch={dispatch}
              setCursorState={setCursorState}
              noMoreCreate={noMoreCreate}
            />
          ))}
        </Layer>
      </Stage>
      <Button
        disabled={annotations.length === 0}
        iconOnly
        text
        styles={{ color: annotations.length === 0 ? 'grey' : 'red', ':hover': { color: 'red' } }}
        content={<CloseIcon size="large" />}
        onClick={(): void => {
          dispatch(removeAnnotation(selectedAnnotationIndex));
          setSelectedAnnotationIndex(null);
        }}
      />
    </div>
  );
};

export default Scene;

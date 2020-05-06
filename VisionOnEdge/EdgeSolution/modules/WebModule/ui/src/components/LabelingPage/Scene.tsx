import React, { FC, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Text, Button, CloseIcon } from '@fluentui/react-northstar';
import { Stage, Layer, Image, Group } from 'react-konva';
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
import RemoveBoxButton from './RemoveBoxButton';

const defaultSize: Size2D = {
  width: 800,
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
  const [image, status, size] = useImage(url, 'anonymous');
  const [selectedAnnotationIndex, setSelectedAnnotationIndex] = useState<number>(null);
  const [workState, setWorkState] = useState<WorkState>(WorkState.None);
  const [cursorPosition, setCursorPosition] = useState<Position2D>({ x: 0, y: 0 });
  const [showOuterRemoveButton, setShowOuterRemoveButton] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const scale = useRef<Position2D>({ x: 1, y: 1 });
  const changeCursorState = useCallback(
    (cursorType?: LabelingCursorStates): void => {
      if (!cursorType) {
        if (noMoreCreate) {
          setCursorState(LabelingCursorStates.default);
        } else {
          setCursorState(LabelingCursorStates.crosshair);
        }
      } else {
        setCursorState(cursorType);
      }
    },
    [noMoreCreate],
  );
  const removeBox = useCallback((): void => {
    dispatch(removeAnnotation(selectedAnnotationIndex));
    setWorkState(WorkState.None);
    setShowOuterRemoveButton(false);
  }, [dispatch, selectedAnnotationIndex, setWorkState, setShowOuterRemoveButton]);
  // console.log(workState, cursorPosition, annotations);
  const onMouseDown = (): void => {
    // * Single bounding box labeling type condition
    if (noMoreCreate || workState === WorkState.Creating) return;

    dispatch(createAnnotation(cursorPosition));
    setSelectedAnnotationIndex(annotations.length - 1);
    setWorkState(WorkState.Creating);
  };

  const onMouseUp = (): void => {
    if (workState === WorkState.Creating) {
      dispatch(updateCreatingAnnotation(cursorPosition));
      if (annotations.length - 1 === selectedAnnotationIndex) {
        setWorkState(WorkState.Selecting);
      } else {
        setWorkState(WorkState.None);
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
      changeCursorState();
      setSelectedAnnotationIndex(0);
    } else {
      changeCursorState();
    }
  }, [noMoreCreate, changeCursorState]);
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
      {annotations.length !== 0 &&
      showOuterRemoveButton &&
      !isDragging &&
      workState !== WorkState.Creating ? (
        <Button
          iconOnly
          text
          styles={{ color: '#F9526B', ':hover': { color: '#E73550' } }}
          content={<CloseIcon size="large" />}
          onClick={removeBox}
        />
      ) : (
        <div style={{ height: '2em' }} />
      )}
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
          onDragStart={(): void => {
            setIsDragging(true);
          }}
          onDragEnd={(): void => {
            setIsDragging(false);
          }}
        >
          <Image image={image} />
          {annotations.map((annotation, i) => (
            <Group key={i}>
              <RemoveBoxButton
                imageSize={imageSize}
                visible={!isDragging && workState !== WorkState.Creating && i === selectedAnnotationIndex}
                label={annotation.label}
                changeCursorState={changeCursorState}
                scale={scale.current.x}
                setShowOuterRemoveButton={setShowOuterRemoveButton}
                removeBox={removeBox}
              />
              <Box2d
                workState={workState}
                cursorPosition={cursorPosition}
                onSelect={onSelect}
                annotation={annotation}
                scale={scale.current.x}
                annotationIndex={i}
                selected={i === selectedAnnotationIndex}
                dispatch={dispatch}
                changeCursorState={changeCursorState}
              />
            </Group>
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default Scene;

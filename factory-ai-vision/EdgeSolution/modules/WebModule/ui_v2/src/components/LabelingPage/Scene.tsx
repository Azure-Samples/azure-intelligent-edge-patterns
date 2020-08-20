import React, { FC, useState, useEffect, useCallback, useRef, Dispatch, useMemo } from 'react';
import { Stage, Layer, Image, Group, Text as KonvaText, Text } from 'react-konva';
import { KonvaEventObject } from 'konva/types/Node';
import { useDispatch } from 'react-redux';

import useImage from './util/useImage';
import getResizeImageFunction from './util/resizeImage';
import { Box2d } from './Box';
import { WorkState, LabelingType, LabelingCursorStates } from './type';
import {
  updateCreatingAnnotation,
  removeAnnotation,
  thunkCreateAnnotation,
} from '../../store/annotationSlice';
import RemoveBoxButton from './RemoveBoxButton';
import { Annotation, Size2D } from '../../store/type';
import { Part } from '../../store/partSlice';
import { thunkChangeImgPart } from '../../store/imageSlice';

const defaultSize: Size2D = {
  width: 800,
  height: 600,
};

interface SceneProps {
  url?: string;
  labelingType: LabelingType;
  annotations: Annotation[];
  workState: WorkState;
  setWorkState: Dispatch<WorkState>;
  onBoxCreated?: () => void;
  partFormDisabled: boolean;
  imgPart: Part;
}
const Scene: FC<SceneProps> = ({
  url = '',
  labelingType,
  annotations,
  workState,
  setWorkState,
  onBoxCreated,
  partFormDisabled,
  imgPart,
}) => {
  const dispatch = useDispatch();
  const resizeImage = useCallback(getResizeImageFunction(defaultSize), [defaultSize]);
  const [imageSize, setImageSize] = useState<Size2D>(defaultSize);
  const noMoreCreate = useMemo(
    () => labelingType === LabelingType.SingleAnnotation && annotations.length === 1,
    [labelingType, annotations],
  );
  const [cursorState, setCursorState] = useState<LabelingCursorStates>(LabelingCursorStates.default);
  const [image, status, size] = useImage(url, 'anonymous');
  const [selectedAnnotationIndex, setSelectedAnnotationIndex] = useState<number>(null);
  const [showOuterRemoveButton, setShowOuterRemoveButton] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const scale = useRef<number>(1);
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
    dispatch(removeAnnotation(annotations[selectedAnnotationIndex].id));
    setWorkState(WorkState.None);
    setShowOuterRemoveButton(false);
    setSelectedAnnotationIndex(null);
  }, [dispatch, annotations, selectedAnnotationIndex, setWorkState]);
  const onMouseDown = (e: KonvaEventObject<MouseEvent>): void => {
    // * Single bounding box labeling type condition
    if (noMoreCreate || workState === WorkState.Creating) return;

    dispatch(thunkCreateAnnotation({ x: e.evt.offsetX / scale.current, y: e.evt.offsetY / scale.current }));
    // FIXME Select the last annotation. Use lenth instead of length -1 because the annotations here is the old one
    // Should put this state in redux
    setSelectedAnnotationIndex(annotations.length);
    setWorkState(WorkState.Creating);
  };

  const onMouseUp = (e: KonvaEventObject<MouseEvent>): void => {
    if (workState === WorkState.Creating) {
      dispatch(
        updateCreatingAnnotation({ x: e.evt.offsetX / scale.current, y: e.evt.offsetY / scale.current }),
      );
      if (annotations.length - 1 === selectedAnnotationIndex) {
        setWorkState(WorkState.Selecting);
        if (onBoxCreated) onBoxCreated();
      } else {
        setWorkState(WorkState.None);
      }
    }
  };

  // FIXIME: Probably use useReduce for this case
  const onSelect = (index: number): void => {
    setSelectedAnnotationIndex(index);
    if (index === null) setWorkState(WorkState.None);
    else setWorkState(WorkState.Selecting);
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
    if (workState === WorkState.None && !noMoreCreate) setSelectedAnnotationIndex(null);
  }, [workState, noMoreCreate]);
  useEffect(() => {
    const [outcomeSize, outcomeScale] = resizeImage(size);
    setImageSize(outcomeSize);
    scale.current = outcomeScale;
  }, [size, resizeImage]);

  const isLoading = status === 'loading' || (imageSize.height === 0 && imageSize.width === 0);

  return (
    <div style={{ margin: '0.2em', position: 'relative' }}>
      <Stage
        width={imageSize.width}
        height={imageSize.height}
        scale={{ x: scale.current, y: scale.current }}
        style={{ cursor: cursorState }}
      >
        <Layer
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onDragStart={(): void => {
            setIsDragging(true);
          }}
          onDragEnd={(): void => {
            setIsDragging(false);
          }}
        >
          <Image image={image} />
          {!isLoading &&
            annotations.map((annotation, i) => (
              <Group key={i}>
                <RemoveBoxButton
                  imageSize={imageSize}
                  visible={!isDragging && workState !== WorkState.Creating && i === selectedAnnotationIndex}
                  label={annotation.label}
                  scale={scale.current}
                  changeCursorState={changeCursorState}
                  setShowOuterRemoveButton={setShowOuterRemoveButton}
                  removeBox={removeBox}
                />
                <Box2d
                  workState={workState}
                  onSelect={onSelect}
                  annotation={annotation}
                  scale={scale.current}
                  annotationIndex={i}
                  selected={i === selectedAnnotationIndex}
                  dispatch={dispatch}
                  changeCursorState={changeCursorState}
                />
                <Text
                  x={annotation.label.x1}
                  y={annotation.label.y1 - 25 / scale.current}
                  fontSize={20 / scale.current}
                  fill="red"
                  text={imgPart?.name}
                  test="part"
                  visible={!partFormDisabled}
                />
              </Group>
            ))}
          {isLoading && (
            <KonvaText
              x={imageSize.width / 2 - 50}
              y={imageSize.height / 2 - 25}
              fontSize={50}
              text="Loading..."
              fill="rgb(255, 0, 0)"
            />
          )}
        </Layer>
      </Stage>
      {/* {false &&
        selectedAnnotationIndex !== null &&
        workState !== WorkState.Creating &&
        annotations[selectedAnnotationIndex] && (
          <PartForm
            top={annotations[0]?.label.y1 * scale.current - 10}
            left={annotations[0]?.label.x2 * scale.current + 10}
            open={true}
            onDismiss={(): void => onSelect(null)}
            selectedPart={imgPart}
            setSelectedPart={(part): void => {
              dispatch(thunkChangeImgPart(part));
            }}
          />
        )} */}
    </div>
  );
};

export default Scene;

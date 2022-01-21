import React, { FC, useState, useEffect, useCallback, useRef, Dispatch } from 'react';
import { Stage, Layer, Image, Group, Text as KonvaText, Text, Label, Tag } from 'react-konva';
import { KonvaEventObject } from 'konva/types/Node';
import { useDispatch } from 'react-redux';

import useImage from './util/useImage';
import resizeImageFunction, { CanvasFit } from './util/resizeImage';
import { Box2d } from './Box';
import { WorkState, LabelingType, LabelingCursorStates } from './type';
import {
  updateCreatingAnnotation,
  removeAnnotation,
  thunkCreateAnnotation,
} from '../../store/annotationSlice';
import { removeImgLabels } from '../../store/imageSlice';
import RemoveBoxButton from './RemoveBoxButton';
import { Annotation, Size2D } from '../../store/type';
import { Part } from '../../store/partSlice';

const defaultSize: Size2D = {
  width: 720,
  height: 520,
};

interface SceneProps {
  url?: string;
  labelingType: LabelingType;
  annotations: Annotation[];
  workState: WorkState;
  setWorkState: Dispatch<WorkState>;
  onBoxCreated?: () => void;
  parts: Part[];
  selectedImageId: number;
  selectedPartId: number;
}
const Scene: FC<SceneProps> = ({
  url = '',
  annotations,
  workState,
  setWorkState,
  onBoxCreated,
  parts,
  selectedImageId,
  selectedPartId,
}) => {
  const dispatch = useDispatch();
  const [imageSize, setImageSize] = useState<Size2D>(defaultSize);
  const noMoreCreate = false;
  const [cursorState, setCursorState] = useState<LabelingCursorStates>(LabelingCursorStates.default);
  const [image, status, size] = useImage(url, 'anonymous');
  const [selectedAnnotationIndex, setSelectedAnnotationIndex] = useState<number>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const scale = useRef<number>(1);

  /**
   * Change the type of cursor. If passing nothing, than it will set to default
   * @param cursorType The css cursor
   */
  const changeCursorState = useCallback(
    (cursorType?: LabelingCursorStates): void => {
      if (cursorType) {
        setCursorState(cursorType);
        return;
      }

      if (selectedPartId === 0) {
        setCursorState(LabelingCursorStates.notAllowed);
        return;
      }

      if (noMoreCreate) {
        setCursorState(LabelingCursorStates.default);
        return;
      }
      setCursorState(LabelingCursorStates.crosshair);
    },
    [noMoreCreate, selectedPartId],
  );

  const onLeaveBoxCursorChange = useCallback(() => {
    if (selectedPartId === 0) {
      setCursorState(LabelingCursorStates.notAllowed);
      return;
    }
    setCursorState(LabelingCursorStates.crosshair);
  }, [selectedPartId]);

  const removeBox = useCallback((): void => {
    // Avoid find undefined annotation
    if (annotations[selectedAnnotationIndex] === undefined) return;

    dispatch(removeImgLabels({ selectedImageId, annotationIndex: annotations[selectedAnnotationIndex].id }));

    dispatch(removeAnnotation(annotations[selectedAnnotationIndex].id));
    setWorkState(WorkState.None);
    setSelectedAnnotationIndex(null);

    if (selectedPartId === 0) {
      setCursorState(LabelingCursorStates.notAllowed);
      return;
    }
    setCursorState(LabelingCursorStates.crosshair);
  }, [dispatch, annotations, selectedAnnotationIndex, setWorkState, selectedImageId, selectedPartId]);

  const onMouseDown = (e: KonvaEventObject<MouseEvent>): void => {
    // remove selecting labeling
    if (workState === WorkState.Selecting && e.target.attrs.name === 'cancel') return;

    // On click box circle & dragging circle
    if (
      workState === WorkState.Selecting &&
      ['anchor-0', 'anchor-1', 'anchor-2', 'anchor-3'].includes(e.target.attrs.name)
    )
      return;

    // Close selecting state when not select part
    if (WorkState.Selecting === workState && selectedPartId === 0) {
      setWorkState(WorkState.None);
      return;
    }

    // Don't work on not select part
    if (WorkState.None === workState && selectedPartId === 0) return;

    dispatch(thunkCreateAnnotation({ x: e.evt.offsetX / scale.current, y: e.evt.offsetY / scale.current }));
    // Select the last annotation. Use lenth instead of length -1 because the annotations here is the old one
    setSelectedAnnotationIndex(annotations.length);
    setWorkState(WorkState.Creating);
  };

  const onMouseUp = (e: KonvaEventObject<MouseEvent>): void => {
    if (workState === WorkState.Creating) {
      dispatch(
        updateCreatingAnnotation({ x: e.evt.offsetX / scale.current, y: e.evt.offsetY / scale.current }),
      );

      if (onBoxCreated) onBoxCreated();
      setWorkState(WorkState.None);
    }
  };

  const onSelect = (index: number): void => {
    setSelectedAnnotationIndex(index);
    if (index === null) setWorkState(WorkState.None);
    else setWorkState(WorkState.Selecting);
  };

  useEffect(() => {
    // * Single bounding box labeling type condition
    if (noMoreCreate) {
      setSelectedAnnotationIndex(0);
    }
    changeCursorState();
  }, [noMoreCreate, changeCursorState]);

  useEffect(() => {
    if (workState === WorkState.None && !noMoreCreate) setSelectedAnnotationIndex(null);
  }, [workState, noMoreCreate]);

  useEffect(() => {
    const [outcomeSize, outcomeScale] = resizeImageFunction(defaultSize, CanvasFit.Contain, size);
    setImageSize(outcomeSize);
    scale.current = outcomeScale;
  }, [size]);

  const isLoading = status === 'loading' || (imageSize.height === 0 && imageSize.width === 0);

  return (
    <div>
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
            annotations.map((annotation, i) => {
              return (
                <Group key={i}>
                  <RemoveBoxButton
                    imageSize={imageSize}
                    visible={!isDragging && workState !== WorkState.Creating && i === selectedAnnotationIndex}
                    label={annotation.label}
                    scale={scale.current}
                    changeCursorState={changeCursorState}
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
                    onLeaveBoxCursorChange={onLeaveBoxCursorChange}
                  />
                  <LabelText
                    x={annotation.label.x1}
                    y={
                      annotation.label.y1 < 20 / scale.current
                        ? annotation.label.y1
                        : annotation.label.y1 - 30 / scale.current
                    }
                    fontSize={20 / scale.current}
                    text={annotation.part && parts.find((part) => part.id === annotation.part).name}
                    padding={5 / scale.current}
                  />
                </Group>
              );
            })}
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
    </div>
  );
};

export default Scene;

type LabelTextProps = {
  x: number;
  y: number;
  fontSize: number;
  padding: number;
  text: string;
};

export const LabelText: React.FC<LabelTextProps> = ({ x, y, fontSize, text, padding }) => {
  if (!text) return null;
  return (
    <Label x={x} y={y}>
      <Tag fill="white" />
      <Text fontSize={fontSize} text={text} padding={padding} />
    </Label>
  );
};

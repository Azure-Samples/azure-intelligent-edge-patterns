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
  // updateSelectingAnnotation,
  removeAnnotation,
  thunkCreateAnnotation,
} from '../../store/annotationSlice';
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
  imgPart: Part;
  parts: Part[];
}
const Scene: FC<SceneProps> = ({
  url = '',
  // labelingType,
  annotations,
  workState,
  setWorkState,
  onBoxCreated,
  // imgPart,
  parts,
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
    setSelectedAnnotationIndex(null);
  }, [dispatch, annotations, selectedAnnotationIndex, setWorkState]);

  const onMouseDown = (e: KonvaEventObject<MouseEvent>): void => {
    // * Single bounding box labeling type condition
    if (noMoreCreate || workState === WorkState.Creating) return;

    // remove selecting labeling
    if (workState === WorkState.Selecting && e.target.attrs.name === 'cancel') return;

    // On click box circle & dragging circle
    if (
      workState === WorkState.Selecting &&
      ['anchor-0', 'anchor-1', 'anchor-2', 'anchor-3'].includes(e.target.attrs.name)
    ) {
      return;
    }

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
            annotations.map((annotation, i) => (
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
                />
                <LabelText
                  x={annotation.label.x1}
                  y={
                    annotation.label.y1 < 20 / scale.current
                      ? annotation.label.y1
                      : annotation.label.y1 - 30 / scale.current
                  }
                  fontSize={20 / scale.current}
                  // text={imgPart?.name}
                  text={annotation.part && parts.find((part) => part.id === annotation.part).name}
                  padding={5 / scale.current}
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

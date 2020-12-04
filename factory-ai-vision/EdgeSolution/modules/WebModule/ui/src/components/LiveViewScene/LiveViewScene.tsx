import React, { useEffect, useRef, useMemo } from 'react';
import { Stage, Image as KonvaImage, Layer } from 'react-konva';
import Konva from 'konva';
import { KonvaEventObject } from 'konva/types/Node';
import { connect } from 'react-redux';
import Axios from 'axios';

import { State } from 'RootStateType';
import { Shape, VideoAnno } from '../../store/shared/BaseShape';
import { InferenceMode } from '../../store/project/projectTypes';
import { Position2D } from '../../store/type';

import {
  CreatingState,
  finishLabel as finishLabelAction,
  onCreatingPoint as onCreatingPointAction,
  removeVideoAnno as removeVideoAnnoAction,
  updateVideoAnno as updateVideoAnnoAction,
  videoAnnosSelectorFactory,
} from '../../store/videoAnnoSlice';
import { selectCameraById } from '../../store/cameraSlice';

import useImage from '../LabelingPage/util/useImage';
import { useInterval } from '../../hooks/useInterval';
import { isAOIShape, isCountingLine, isDangerZone } from '../../store/shared/VideoAnnoUtil';
import { dummyFunction } from '../../utils/dummyFunction';
import { plusOrderVideoAnnos } from '../../utils/plusVideoAnnos';

import { VideoAnnosGroup } from './VideoAnnosGroup';

/**
 * Because the layer has been scaled to fit the window size, we need to transform the coordinate to the
 * original image coordinate
 * @param layer
 */
const getRelativePosition = (layer: Konva.Layer): { x: number; y: number } => {
  const transform = layer.getAbsoluteTransform().copy();
  transform.invert();
  const pos = layer.getStage().getPointerPosition();
  return transform.point(pos);
};

type StateProps = {
  videoAnnos: VideoAnno[];
  creatingShape: Shape;
  AOIVisible: boolean;
  countingLineVisible: boolean;
  dangerZoneVisible: boolean;
  creatingState: CreatingState;
  disableVideoFeed: boolean;
};

type OwnProps = {
  cameraId: number;
};

type DispatchProps = {
  onCreatingPoint: (point: Position2D) => void;
  updateVideoAnno: (id: string, changes) => void;
  removeVideoAnno: (id: string) => void;
  finishLabel: () => void;
};

type LiveViewProps = OwnProps & StateProps & DispatchProps;

const mapState = (state: State, { cameraId }: OwnProps): StateProps => ({
  videoAnnos: videoAnnosSelectorFactory(cameraId)(state),
  creatingShape: state.videoAnnos.shape,
  AOIVisible: Boolean(selectCameraById(state, cameraId)?.useAOI),
  countingLineVisible:
    selectCameraById(state, cameraId)?.useCountingLine &&
    [InferenceMode.PartCounting, InferenceMode.DefectDetection].includes(state.project.data.inferenceMode),
  dangerZoneVisible:
    selectCameraById(state, cameraId)?.useDangerZone &&
    state.project.data.inferenceMode === InferenceMode.EmployeeSafety,
  creatingState: state.videoAnnos.creatingState,
  disableVideoFeed: state.project.data.disableVideoFeed,
});

const mapDispatch = (dispatch, { cameraId }: OwnProps): DispatchProps => ({
  onCreatingPoint: (point) => dispatch(onCreatingPointAction({ point, cameraId })),
  updateVideoAnno: (id, changes) => dispatch(updateVideoAnnoAction({ id, changes })),
  removeVideoAnno: (annoId) => dispatch(removeVideoAnnoAction(annoId)),
  finishLabel: () => dispatch(finishLabelAction()),
});

const Component: React.FC<LiveViewProps> = ({
  cameraId,
  videoAnnos,
  creatingShape,
  onCreatingPoint,
  updateVideoAnno,
  removeVideoAnno,
  finishLabel,
  AOIVisible,
  countingLineVisible,
  creatingState,
  dangerZoneVisible,
  disableVideoFeed,
}) => {
  const [imgEle, status, { width: imgWidth, height: imgHeight }] = useImage(
    disableVideoFeed ? '' : `/video_feed?cam_id=${cameraId}`,
    '',
    true,
    true,
  );
  const divRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef(null);
  const imgRef = useRef(null);
  const layerRef = useRef<Konva.Layer>(null);

  useInterval(
    () => {
      Axios.get(`/video_feed/keep_alive?cam_id=${cameraId}`).catch(console.error);
    },
    disableVideoFeed ? null : 3000,
  );

  /* The component need to support image with Content-type "multipart/x-mixed-replace",
     which will keep updating the image data.
     Keep updating the canvas by using Konva.Animation so we can see the latest image.
  */
  useEffect(() => {
    const anim = new Konva.Animation(dummyFunction, layerRef.current);
    anim.start();

    return (): void => {
      anim.stop();
    };
  }, []);

  useEffect(() => {
    const { width: divWidth, height: divHeight } = divRef.current.getBoundingClientRect();
    stageRef.current.width(divWidth);
    stageRef.current.height(divHeight);
  }, []);

  /* Fit Image to Stage */
  useEffect(() => {
    if (imgWidth !== 0 && imgHeight !== 0) {
      const { width: stageWidth, height: stageHeight } = stageRef.current.size();
      const scale = Math.min(stageWidth / imgWidth, stageHeight / imgHeight);
      layerRef.current.scale({ x: scale, y: scale });

      const offsetX = (stageWidth - imgWidth * scale) / 2;
      const offsetY = (stageHeight - imgHeight * scale) / 2;
      layerRef.current.position({ x: offsetX, y: offsetY });
    }
  }, [imgHeight, imgWidth]);

  const onMouseDown = (e: KonvaEventObject<MouseEvent>): void => {
    if (creatingState === CreatingState.Disabled) return;

    const { x, y } = getRelativePosition(e.target.getLayer());
    onCreatingPoint({ x, y });
  };

  const onMouseMove = (e: KonvaEventObject<MouseEvent>): void => {
    if (creatingState !== CreatingState.Creating) return;

    const { x, y } = getRelativePosition(e.target.getLayer());
    if (creatingShape === Shape.BBox) updateVideoAnno(videoAnnos[videoAnnos.length - 1].id, { x2: x, y2: y });
    else if (creatingShape === Shape.Polygon || creatingShape === Shape.Line)
      updateVideoAnno(videoAnnos[videoAnnos.length - 1].id, {
        idx: -1,
        vertex: { x, y },
      });
  };

  useEffect(() => {
    const div = divRef.current;
    const handleKeyPress = (e) => {
      if (e.key === 'd') {
        finishLabel();
      }
    };
    div.addEventListener('keydown', handleKeyPress);
    return () => {
      div.removeEventListener('keydown', handleKeyPress);
    };
  }, [finishLabel]);

  const AOIs = useMemo(() => {
    return videoAnnos.filter(isAOIShape);
  }, [videoAnnos]);

  const countingLines = useMemo(() => {
    return plusOrderVideoAnnos(videoAnnos.filter(isCountingLine));
  }, [videoAnnos]);

  const dangerZone = useMemo(() => {
    return plusOrderVideoAnnos(videoAnnos.filter(isDangerZone));
  }, [videoAnnos]);

  return (
    <div
      ref={divRef}
      style={{ width: '100%', height: '100%', backgroundColor: 'black', minHeight: '500px' }}
      tabIndex={0}
    >
      {disableVideoFeed && (
        <p style={{ color: 'white' }}>
          You have disabled the live video in advaced setting. Enable it to show the video.
        </p>
      )}
      <Stage ref={stageRef} style={{ cursor: creatingState !== CreatingState.Disabled ? 'crosshair' : '' }}>
        <Layer ref={layerRef} onMouseDown={onMouseDown} onMouseMove={onMouseMove}>
          <KonvaImage image={imgEle} ref={imgRef} />
          {
            /* Render when image is loaded to prevent the shapes show in unscale size */
            status === 'loaded' && (
              <>
                {/** AOIs */}
                <VideoAnnosGroup
                  imgWidth={imgWidth}
                  imgHeight={imgHeight}
                  videoAnnos={AOIs}
                  updateVideoAnno={updateVideoAnno}
                  removeVideoAnno={removeVideoAnno}
                  visible={AOIVisible}
                  creatingState={creatingState}
                  needMask={true}
                />
                {/** Counting Lines */}
                <VideoAnnosGroup
                  imgWidth={imgWidth}
                  imgHeight={imgHeight}
                  videoAnnos={countingLines}
                  updateVideoAnno={updateVideoAnno}
                  removeVideoAnno={removeVideoAnno}
                  visible={countingLineVisible}
                  creatingState={creatingState}
                  needMask={false}
                />
                {/** Danger Zones */}
                <VideoAnnosGroup
                  imgWidth={imgWidth}
                  imgHeight={imgHeight}
                  videoAnnos={dangerZone}
                  updateVideoAnno={updateVideoAnno}
                  removeVideoAnno={removeVideoAnno}
                  visible={dangerZoneVisible}
                  creatingState={creatingState}
                  needMask={false}
                  color="yellow"
                />
              </>
            )
          }
        </Layer>
      </Stage>
    </div>
  );
};

export const LiveViewScene = connect(mapState, mapDispatch)(Component);

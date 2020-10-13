import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Axios from 'axios';

import { State } from 'RootStateType';
import { LiveViewScene } from './LiveViewScene';
import useImage from '../LabelingPage/util/useImage';
import { useInterval } from '../../hooks/useInterval';
import { selectCameraById } from '../../store/cameraSlice';
import {
  selectVideoAnnosByCamera,
  updateVideoAnno,
  onCreatingPoint,
  removeVideoAnno,
  finishLabel,
} from '../../store/videoAnnoSlice';
import { InferenceMode } from '../../store/project/projectTypes';

export const LiveViewContainer: React.FC<{
  showVideo: boolean;
  cameraId: number;
}> = ({ showVideo, cameraId }) => {
  const showAOI = useSelector<State, boolean>((state) => selectCameraById(state, cameraId)?.useAOI);
  const showCountingLine = useSelector<State, boolean>(
    (state) =>
      selectCameraById(state, cameraId)?.useCountingLine &&
      [InferenceMode.PartCounting, InferenceMode.DefectDetection].includes(state.project.data.inferenceMode),
  );
  const showDangerZone = useSelector(
    (state: State) =>
      selectCameraById(state, cameraId)?.useDangerZone &&
      state.project.data.inferenceMode === InferenceMode.EmployeeSafety,
  );
  const videoAnnos = useSelector(selectVideoAnnosByCamera(cameraId));
  const [showUpdateSuccessTxt, setShowUpdateSuccessTxt] = useState(false);
  const imageInfo = useImage(`/video_feed?cam_id=${cameraId}`, '', true, true);
  const creatingVideoAnno = useSelector((state: State) => state.videoAnnos.creatingState);
  const videoAnnoShape = useSelector((state: State) => state.videoAnnos.shape);
  const dispatch = useDispatch();

  useEffect(() => {
    if (showUpdateSuccessTxt) {
      const timer = setTimeout(() => {
        setShowUpdateSuccessTxt(false);
      }, 3000);
      return (): void => clearTimeout(timer);
    }
  }, [showUpdateSuccessTxt]);

  useInterval(() => {
    Axios.get(`/video_feed/keep_alive?cam_id=${cameraId}`).catch(console.error);
  }, 3000);

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: 'black', minHeight: '500px' }}>
      {showVideo ? (
        <LiveViewScene
          videoAnnos={videoAnnos}
          creatingShape={videoAnnoShape}
          onCreatingPoint={(point) => dispatch(onCreatingPoint({ point, cameraId }))}
          updateVideoAnno={(id, changes) => dispatch(updateVideoAnno({ id, changes }))}
          removeVideoAnno={(annoId) => dispatch(removeVideoAnno(annoId))}
          finishLabel={() => dispatch(finishLabel())}
          AOIVisible={showAOI}
          countingLineVisible={showCountingLine}
          dangerZoneVisible={showDangerZone}
          imageInfo={imageInfo}
          creatingState={creatingVideoAnno}
        />
      ) : null}
    </div>
  );
};

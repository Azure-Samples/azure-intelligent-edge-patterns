import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Axios from 'axios';

import { State } from 'RootStateType';
import { LiveViewScene } from './LiveViewScene';
import useImage from '../LabelingPage/util/useImage';
import { useInterval } from '../../hooks/useInterval';
import { selectCameraById } from '../../store/cameraSlice';
import { selectAOIsByCamera, updateAOI, onCreatingPoint, removeAOI, finishLabel } from '../../store/AOISlice';

export const LiveViewContainer: React.FC<{
  showVideo: boolean;
  cameraId: number;
}> = ({ showVideo, cameraId }) => {
  const showAOI = useSelector<State, boolean>((state) => selectCameraById(state, cameraId)?.useAOI);
  const AOIs = useSelector(selectAOIsByCamera(cameraId));
  const [showUpdateSuccessTxt, setShowUpdateSuccessTxt] = useState(false);
  const imageInfo = useImage(`/api/inference/video_feed?camera_id=${cameraId}`, '', true, true);
  const creatingAOI = useSelector((state: State) => state.AOIs.creatingState);
  const AOIShape = useSelector((state: State) => state.AOIs.shape);
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
    Axios.get('/api/inference/video_feed/keep_alive').catch(console.error);
  }, 3000);

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: 'black' }}>
      {showVideo ? (
        <LiveViewScene
          AOIs={AOIs}
          creatingShape={AOIShape}
          onCreatingPoint={(point) => dispatch(onCreatingPoint({ point, cameraId }))}
          updateAOI={(id, changes) => dispatch(updateAOI({ id, changes }))}
          removeAOI={(AOIId) => dispatch(removeAOI(AOIId))}
          finishLabel={() => dispatch(finishLabel())}
          visible={showAOI}
          imageInfo={imageInfo}
          creatingState={creatingAOI}
        />
      ) : null}
    </div>
  );
};

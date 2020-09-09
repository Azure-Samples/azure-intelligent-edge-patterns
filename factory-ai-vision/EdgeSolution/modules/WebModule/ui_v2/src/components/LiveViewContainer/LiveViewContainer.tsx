import React, { useState, useEffect } from 'react';
import * as R from 'ramda';
import { Text, Button, Stack, Toggle } from '@fluentui/react';
import { useDispatch, useSelector } from 'react-redux';
import Axios from 'axios';

import { State } from 'RootStateType';
import { LiveViewScene } from './LiveViewScene';
import useImage from '../LabelingPage/util/useImage';
import { useInterval } from '../../hooks/useInterval';
import { selectCameraById } from '../../store/cameraSlice';
import {
  selectAOIsByCamera,
  updateAOI,
  onCreatingPoint,
  removeAOI,
  selectOriginAOIsByCamera,
  onCreateAOIBtnClick,
  finishLabel,
} from '../../store/AOISlice';
import { toggleShowAOI, updateCameraArea } from '../../store/actions';
import { Shape } from '../../store/shared/BaseShape';

export const LiveViewContainer: React.FC<{
  showVideo: boolean;
  cameraId: number;
  onDeleteProject: () => void;
}> = ({ showVideo, cameraId, onDeleteProject }) => {
  const showAOI = useSelector<State, boolean>((state) => selectCameraById(state, cameraId)?.useAOI);
  const AOIs = useSelector(selectAOIsByCamera(cameraId));
  const originAOIs = useSelector(selectOriginAOIsByCamera(cameraId));
  const [showUpdateSuccessTxt, setShowUpdateSuccessTxt] = useState(false);
  const [loading, setLoading] = useState(false);
  const imageInfo = useImage(`/api/inference/video_feed?camera_id=${cameraId}`, '', true, true);
  const creatingAOI = useSelector((state: State) => state.AOIs.creatingState);
  const AOIShape = useSelector((state: State) => state.AOIs.shape);
  const dispatch = useDispatch();

  const onCheckboxClick = async (): Promise<void> => {
    setLoading(true);
    try {
      await dispatch(toggleShowAOI({ cameraId, showAOI: !showAOI }));
      setShowUpdateSuccessTxt(true);
    } catch (e) {
      alert(e);
    }
    setLoading(false);
  };

  const onUpdate = async (): Promise<void> => {
    setLoading(true);
    try {
      await dispatch(updateCameraArea(cameraId));
      setShowUpdateSuccessTxt(true);
    } catch (e) {
      alert(e);
    }
    setLoading(false);
  };

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

  const hasEdit = !R.equals(originAOIs, AOIs);
  const updateBtnDisabled = !showAOI || !hasEdit;

  return (
    <Stack tokens={{ childrenGap: 10 }} style={{ height: '100%' }}>
      {/* <Stack horizontal tokens={{ childrenGap: 10 }}>
        <Toggle label="Enable area of interest" checked={showAOI} onClick={onCheckboxClick} inlineLabel />
        <Button
          text="Create Box"
          primary={AOIShape === Shape.BBox}
          disabled={!showAOI}
          onClick={(): void => {
            dispatch(onCreateAOIBtnClick(Shape.BBox));
          }}
          style={{ padding: '0 5px' }}
        />
        <Button
          text={AOIShape === Shape.Polygon ? 'Click F to Finish' : 'Create Polygon'}
          primary={AOIShape === Shape.Polygon}
          disabled={!showAOI}
          onClick={(): void => {
            dispatch(onCreateAOIBtnClick(Shape.Polygon));
          }}
          style={{ padding: '0 5px' }}
        />
        <Button text="Update" primary disabled={updateBtnDisabled || loading} onClick={onUpdate} />
        <Text style={{ visibility: showUpdateSuccessTxt ? 'visible' : 'hidden' }}>Updated!</Text>
        {<Provider theme={errorTheme}>
          <WarningDialog
            contentText={<p>Sure you want to delete the configuration?</p>}
            trigger={
              <Button content="Delete Configuration" primary circular styles={{ marginRight: 'auto' }} />
            }
            onConfirm={onDeleteProject}
          />
        </Provider>}
      </Stack> */}
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
    </Stack>
  );
};

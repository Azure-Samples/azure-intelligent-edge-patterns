import React, { useState, useEffect, useRef } from 'react';
import * as R from 'ramda';
import uniqid from 'uniqid';
import { Text, Checkbox, Flex, Provider } from '@fluentui/react-northstar';
import { useDispatch, useSelector } from 'react-redux';
import Axios from 'axios';

import { Button } from '../Button';
import { LiveViewScene } from './LiveViewScene';
import { AOIData, Box } from '../../type';
import useImage from '../LabelingPage/util/useImage';
import { CreatingState } from './LiveViewContainer.type';
import { errorTheme } from '../../themes/errorTheme';
import { WarningDialog } from '../WarningDialog';
import { patchCameraArea } from '../../store/camera/cameraActions';
import { useInterval } from '../../hooks/useInterval';
import { selectCameraById } from '../../store/cameraSlice';
import { State } from 'RootStateType';
import { selectAOIsByCamera, AOI } from '../../store/AOISlice';

export const LiveViewContainer: React.FC<{
  showVideo: boolean;
  initialAOIData: AOIData;
  cameraId: number;
  onDeleteProject: () => void;
}> = ({ showVideo, initialAOIData, cameraId, onDeleteProject }) => {
  const showAOI = useSelector<State, boolean>((state) => selectCameraById(state, cameraId).useAOI);
  // const [showAOI, setShowAOI] = useState(initialAOIData.useAOI);
  // const lasteUpdatedAOIs = useRef(initialAOIData.AOIs);
  // const [AOIs, setAOIs] = useState<Box[]>(lasteUpdatedAOIs.current);
  const AOIs = useSelector(selectAOIsByCamera(cameraId));
  const [showUpdateSuccessTxt, setShowUpdateSuccessTxt] = useState(false);
  const [loading, setLoading] = useState(false);
  const imageInfo = useImage('/api/inference/video_feed', '', true, true);
  const [creatingAOI, setCreatingAOI] = useState(CreatingState.Disabled);
  const dispatch = useDispatch();

  const onCheckboxClick = async (): Promise<void> => {
    // setShowAOI(!showAOI);
    // setLoading(true);
    // try {
    //   await dispatch(patchCameraArea({ AOIs: lasteUpdatedAOIs.current, useAOI: !showAOI }, cameraId));
    //   setShowUpdateSuccessTxt(true);
    //   // If showAOI is false, show the latest update aoi
    //   // Note, probably use the same method `originEntites` like annoSlice
    //   if (!showAOI) setAOIs(lasteUpdatedAOIs.current);
    // } catch (e) {
    //   // Set back to the state before updating for switch case
    //   setShowAOI(showAOI);
    // }
    // setLoading(false);
  };

  const onUpdate = async (): Promise<void> => {
    // setLoading(true);
    // try {
    //   await dispatch(patchCameraArea({ AOIs, useAOI: showAOI }, cameraId));
    //   setShowUpdateSuccessTxt(true);
    //   lasteUpdatedAOIs.current = R.clone(AOIs);
    // } catch (e) {
    //   console.error(e);
    // }
    // setLoading(false);
  };

  useEffect(() => {
    if (showUpdateSuccessTxt) {
      const timer = setTimeout(() => {
        setShowUpdateSuccessTxt(false);
      }, 3000);
      return (): void => clearTimeout(timer);
    }
  }, [showUpdateSuccessTxt]);

  useEffect(() => {
    // if (!AOIs.length)
    //   setAOIs([
    //     {
    //       id: uniqid(),
    //       x1: imageInfo[2].width * 0.1,
    //       y1: imageInfo[2].height * 0.1,
    //       x2: imageInfo[2].width * 0.9,
    //       y2: imageInfo[2].height * 0.9,
    //     },
    //   ]);
  }, [AOIs.length, imageInfo[2].width, imageInfo[2].height]);

  useInterval(() => {
    Axios.get('/api/inference/video_feed/keep_alive').catch(console.error);
  }, 3000);

  // const hasEdit = !R.equals(lasteUpdatedAOIs.current, AOIs);
  const hasEdit = false;
  const updateBtnDisabled = !showAOI || !hasEdit;

  return (
    <Flex column gap="gap.medium" styles={{ height: '100%' }}>
      <Flex gap="gap.small">
        {/* {error && <Alert danger header="Failed to Update!" content={`${error.name}: ${error.message}`} />} */}
        <Checkbox
          labelPosition="start"
          label="Enable area of interest"
          toggle
          checked={showAOI}
          onClick={onCheckboxClick}
        />
        <Button
          content="Create AOI"
          primary={creatingAOI !== CreatingState.Disabled}
          disabled={!showAOI}
          onClick={(): void => {
            if (creatingAOI === CreatingState.Disabled) setCreatingAOI(CreatingState.Waiting);
            else setCreatingAOI(CreatingState.Disabled);
          }}
          circular
          styles={{ padding: '0 5px' }}
        />
        <Button
          content="Update"
          primary
          disabled={updateBtnDisabled}
          onClick={onUpdate}
          loading={loading}
          circular
        />
        <Text styles={{ visibility: showUpdateSuccessTxt ? 'visible' : 'hidden' }}>Updated!</Text>
        <Provider theme={errorTheme}>
          <WarningDialog
            contentText={<p>Sure you want to delete the configuration?</p>}
            trigger={
              <Button content="Delete Configuration" primary circular styles={{ marginRight: 'auto' }} />
            }
            onConfirm={onDeleteProject}
          />
        </Provider>
      </Flex>
      <div style={{ width: '100%', height: '100%', backgroundColor: 'black' }}>
        {showVideo ? (
          <LiveViewScene
            AOIs={AOIs}
            setAOIs={() => {}}
            visible={showAOI}
            imageInfo={imageInfo}
            creatingState={creatingAOI}
            setCreatingState={setCreatingAOI}
          />
        ) : null}
      </div>
    </Flex>
  );
};

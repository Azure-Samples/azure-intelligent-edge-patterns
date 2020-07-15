import React, { useState, useEffect, useRef } from 'react';
import * as R from 'ramda';
import Axios from 'axios';
import uniqid from 'uniqid';
import { Text, Checkbox, Flex, Alert, Provider } from '@fluentui/react-northstar';

import { Button } from '../Button';
import { LiveViewScene } from './LiveViewScene';
import { AOIData, Box } from '../../type';
import useImage from '../LabelingPage/util/useImage';
import { CreatingState } from './LiveViewContainer.type';
import { errorTheme } from '../../themes/errorTheme';
import { WarningDialog } from '../WarningDialog';

export const LiveViewContainer: React.FC<{
  showVideo: boolean;
  initialAOIData: AOIData;
  cameraId: number;
  onDeleteProject: () => void;
}> = ({ showVideo, initialAOIData, cameraId, onDeleteProject }) => {
  const [showAOI, setShowAOI] = useState(initialAOIData.useAOI);
  const lasteUpdatedAOIs = useRef(initialAOIData.AOIs);
  const [AOIs, setAOIs] = useState<Box[]>(lasteUpdatedAOIs.current);
  const [showUpdateSuccessTxt, setShowUpdateSuccessTxt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>(null);
  const imageInfo = useImage(`http://${window.location.hostname}:5000/video_feed?inference=1`, '', true);
  const [creatingAOI, setCreatingAOI] = useState(CreatingState.Disabled);

  const onCheckboxClick = async (): Promise<void> => {
    setShowAOI(!showAOI);
    setLoading(true);
    setError(null);
    try {
      await Axios.patch(`/api/cameras/${cameraId}/`, {
        area: JSON.stringify({
          useAOI: !showAOI,
          AOIs: lasteUpdatedAOIs.current,
        }),
      });
      setShowUpdateSuccessTxt(true);
      if (!showAOI) setAOIs(lasteUpdatedAOIs.current);
    } catch (e) {
      // Set back to the state before updating for switch case
      setShowAOI(showAOI);
      setError(e);
    }
    setLoading(false);
  };

  const onUpdate = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await Axios.patch(`/api/cameras/${cameraId}/`, {
        area: JSON.stringify({
          useAOI: showAOI,
          AOIs,
        }),
      });
      setShowUpdateSuccessTxt(true);
      lasteUpdatedAOIs.current = R.clone(AOIs);
    } catch (e) {
      setError(e);
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

  useEffect(() => {
    if (!AOIs.length)
      setAOIs([
        {
          id: uniqid(),
          x1: imageInfo[2].width * 0.1,
          y1: imageInfo[2].height * 0.1,
          x2: imageInfo[2].width * 0.9,
          y2: imageInfo[2].height * 0.9,
        },
      ]);
  }, [AOIs.length, imageInfo[2].width, imageInfo[2].height]);

  const hasEdit = !R.equals(lasteUpdatedAOIs.current, AOIs);
  const updateBtnDisabled = !showAOI || !hasEdit;

  return (
    <Flex column gap="gap.medium" styles={{ height: '100%' }}>
      <Flex gap="gap.small">
        {error && <Alert danger header="Failed to Update!" content={`${error.name}: ${error.message}`} />}
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
            setAOIs={setAOIs}
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

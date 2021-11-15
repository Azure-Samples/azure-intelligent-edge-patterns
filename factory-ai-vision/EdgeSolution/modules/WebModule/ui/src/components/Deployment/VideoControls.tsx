import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ActionButton, PrimaryButton, Stack, Toggle, Text } from '@fluentui/react';
import * as R from 'ramda';

import { State } from 'RootStateType';
import {
  toggleShowAOI,
  toggleShowCountingLines,
  toggleShowDangerZones,
  updateCameraArea,
} from '../../store/actions';
import { selectCameraById } from '../../store/cameraSlice';
import {
  onCreateVideoAnnoBtnClick,
  originVideoAnnosSelectorFactory,
  videoAnnosSelectorFactory,
} from '../../store/videoAnnoSlice';
import { Purpose, Shape } from '../../store/shared/BaseShape';
import { InferenceMode } from '../../store/project/projectTypes';

type VideoAnnosControlsProps = {
  cameraId: number;
};

const getLabel = (inferenceMode: InferenceMode) => {
  if (inferenceMode === InferenceMode.EmptyShelfAlerts) return 'shelf zone';
  if (inferenceMode === InferenceMode.TotalCustomerCounting) return 'counting zone';
  if (inferenceMode === InferenceMode.CrowdedQueueAlert) return 'queue zone';
  return 'danger zones';
};

export const VideoAnnosControls: React.FC<VideoAnnosControlsProps> = ({ cameraId }) => {
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line no-undef
  const showAOI = useSelector<State, boolean>((state) => selectCameraById(state, cameraId)?.useAOI);
  const showCountingLine = useSelector<State, boolean>(
    (state) => selectCameraById(state, cameraId)?.useCountingLine,
  );
  const showDangerZone = useSelector<State, boolean>(
    (state) => selectCameraById(state, cameraId)?.useDangerZone,
  );
  const videoAnnosSelector = useMemo(() => videoAnnosSelectorFactory(cameraId), [cameraId]);
  const videoAnnos = useSelector(videoAnnosSelector);
  const originVideoAnnosSelector = useMemo(() => originVideoAnnosSelectorFactory(cameraId), [cameraId]);
  const originVideoAnnos = useSelector(originVideoAnnosSelector);
  const [showUpdateSuccessTxt, setShowUpdateSuccessTxt] = useState(false);
  const videoAnnoShape = useSelector((state: State) => state.videoAnnos.shape);
  const videoAnnoPurpose = useSelector((state: State) => state.videoAnnos.purpose);
  const inferenceMode = useSelector((state: State) => state.project.data.inferenceMode);
  const dispatch = useDispatch();

  const onAOIToggleClick = async (): Promise<void> => {
    setLoading(true);
    await dispatch(toggleShowAOI({ cameraId, checked: !showAOI }));
    setShowUpdateSuccessTxt(true);
    setLoading(false);
  };

  const onCountingLineToggleClick = async () => {
    setLoading(true);
    await dispatch(toggleShowCountingLines({ cameraId, checked: !showCountingLine }));
    setShowUpdateSuccessTxt(true);
    setLoading(false);
  };

  const onDangerZoneToggleClick = async (): Promise<void> => {
    setLoading(true);
    await dispatch(toggleShowDangerZones({ cameraId, checked: !showDangerZone }));
    setShowUpdateSuccessTxt(true);
    setLoading(false);
  };

  const onUpdate = async (): Promise<void> => {
    setLoading(true);
    await dispatch(updateCameraArea(cameraId));
    setShowUpdateSuccessTxt(true);
    setLoading(false);
  };

  const hasEdit = !R.equals(originVideoAnnos, videoAnnos);
  const updateBtnDisabled = !hasEdit;

  return (
    <Stack tokens={{ childrenGap: 10, padding: 20 }}>
      <Text>Use areas of interest to section parts of the image into separate inference zones</Text>
      <Toggle label="Enable area of interest" checked={showAOI} onClick={onAOIToggleClick} inlineLabel />
      <ActionButton
        iconProps={{ iconName: 'Add' }}
        text="Create Box"
        checked={videoAnnoShape === Shape.BBox && videoAnnoPurpose === Purpose.AOI}
        disabled={!showAOI}
        onClick={(): void => {
          dispatch(onCreateVideoAnnoBtnClick({ shape: Shape.BBox, purpose: Purpose.AOI }));
        }}
      />
      <ActionButton
        iconProps={{ iconName: 'Add' }}
        text={
          videoAnnoShape === Shape.Polygon && videoAnnoPurpose === Purpose.AOI
            ? 'Press D to Finish'
            : 'Create Polygon'
        }
        checked={videoAnnoShape === Shape.Polygon && videoAnnoPurpose === Purpose.AOI}
        disabled={!showAOI}
        onClick={(): void => {
          dispatch(onCreateVideoAnnoBtnClick({ shape: Shape.Polygon, purpose: Purpose.AOI }));
        }}
      />
      {[InferenceMode.PartCounting].includes(inferenceMode) && (
        <>
          <Toggle
            label="Enable counting lines"
            checked={showCountingLine}
            onClick={onCountingLineToggleClick}
            inlineLabel
          />
          <ActionButton
            iconProps={{ iconName: 'Add' }}
            text="Create counting line"
            checked={videoAnnoShape === Shape.Line && videoAnnoPurpose === Purpose.Counting}
            disabled={!showCountingLine}
            onClick={(): void => {
              dispatch(onCreateVideoAnnoBtnClick({ shape: Shape.Line, purpose: Purpose.Counting }));
            }}
          />
        </>
      )}
      {[
        InferenceMode.EmployeeSafety,
        InferenceMode.EmptyShelfAlerts,
        InferenceMode.TotalCustomerCounting,
        InferenceMode.CrowdedQueueAlert,
      ].includes(inferenceMode) && (
        <>
          <Toggle
            label={`Enable ${getLabel(inferenceMode)}`}
            checked={showDangerZone}
            onClick={onDangerZoneToggleClick}
            inlineLabel
          />
          <ActionButton
            iconProps={{ iconName: 'Add' }}
            text={`Create ${getLabel(inferenceMode)}`}
            checked={videoAnnoShape === Shape.BBox && videoAnnoPurpose === Purpose.DangerZone}
            disabled={!showDangerZone}
            onClick={(): void => {
              dispatch(onCreateVideoAnnoBtnClick({ shape: Shape.BBox, purpose: Purpose.DangerZone }));
            }}
          />
          <ActionButton
            iconProps={{ iconName: 'Add' }}
            text={
              videoAnnoShape === Shape.Polygon && videoAnnoPurpose === Purpose.DangerZone
                ? 'Press D to Finish'
                : 'Create Polygon'
            }
            checked={videoAnnoShape === Shape.Polygon && videoAnnoPurpose === Purpose.DangerZone}
            disabled={!showDangerZone}
            onClick={(): void => {
              dispatch(onCreateVideoAnnoBtnClick({ shape: Shape.Polygon, purpose: Purpose.DangerZone }));
            }}
          />
        </>
      )}
      <Text style={{ visibility: showUpdateSuccessTxt ? 'visible' : 'hidden' }}>Updated!</Text>
      <PrimaryButton text="Update" disabled={updateBtnDisabled || loading} onClick={onUpdate} />
    </Stack>
  );
};

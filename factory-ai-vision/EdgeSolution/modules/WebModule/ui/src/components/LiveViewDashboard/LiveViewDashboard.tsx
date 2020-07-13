import React, { useEffect, useState } from 'react';
import { Flex, Text, Loader, Alert } from '@fluentui/react-northstar';
import { useDispatch, useSelector } from 'react-redux';

import { useInterval } from '../../hooks/useInterval';
import {
  thunkGetTrainingLog,
  thunkGetTrainingMetrics,
  thunkGetInferenceMetrics,
  changeStatus,
} from '../../store/project/projectActions';
import { Project, Status as CameraConfigStatus } from '../../store/project/projectTypes';
import { State } from '../../store/State';
import { LiveViewContainer } from '../LiveViewContainer';
import { InferenceMetricDashboard } from './InferenceMetricDashboard';
import { Button } from '../Button';
import { ConsequenceDashboard } from './ConsequenceDashboard';
import { AOIData } from '../../type';
import { Camera } from '../../store/camera/cameraTypes';

const getAOIData = (cameraArea: string): AOIData => {
  try {
    return JSON.parse(cameraArea);
  } catch (e) {
    return {
      useAOI: false,
      AOIs: [],
    };
  }
};

export const LiveViewDashboard: React.FC = () => {
  const {
    error,
    trainingLog,
    status,
    trainingMetrics,
    data: { id: projectId, camera: projectCameraId },
  } = useSelector<State, Project>((state) => state.project);
  const allTrainingLog = useAllTrainingLog(trainingLog);
  const dispatch = useDispatch();
  const [showConsequenceDashboard, setShowConsequenceDashboard] = useState(false);

  useEffect(() => {
    dispatch(thunkGetTrainingLog(projectId));
  }, [dispatch, projectId]);
  useInterval(
    () => {
      dispatch(thunkGetTrainingLog(projectId));
    },
    status === CameraConfigStatus.WaitTraining ? 5000 : null,
  );

  useEffect(() => {
    if (status === CameraConfigStatus.FinishTraining) {
      dispatch(thunkGetTrainingMetrics(projectId));
    }
  }, [dispatch, status, projectId]);

  useInterval(
    () => {
      dispatch(thunkGetInferenceMetrics(projectId));
    },
    status === CameraConfigStatus.StartInference ? 5000 : null,
  );

  useEffect(() => {
    return (): void => {
      dispatch(changeStatus(CameraConfigStatus.None));
    };
  }, [dispatch]);

  // FIXME Integrate this with Redux
  const cameras = useSelector<State, Camera[]>((state) => state.cameras);
  const selectedCamera = cameras.find((cam) => cam.id === projectCameraId);

  if (!selectedCamera || selectedCamera.is_demo) return null;

  const aoiData = getAOIData(selectedCamera?.area);

  if (status === CameraConfigStatus.WaitTraining || status === CameraConfigStatus.None)
    return (
      <>
        <Loader size="smallest" />
        <pre>{allTrainingLog}</pre>
      </>
    );

  return (
    <Flex column gap="gap.medium" styles={{ height: '100%' }}>
      <Flex column style={{ height: '100%' }} gap="gap.small">
        {error && <Alert danger header={error.name} content={`${error.message}`} />}
        <div style={{ flexGrow: 2 }}>
          <LiveViewContainer showVideo={true} initialAOIData={aoiData} cameraId={projectCameraId} />
        </div>
        <InferenceMetricDashboard />
      </Flex>
      <Flex hAlign="center" column gap="gap.small">
        <Text weight="bold">Detail of Training Metric</Text>
        <Button
          content={showConsequenceDashboard ? 'Hide' : 'Show'}
          primary
          onClick={(): void => setShowConsequenceDashboard((prev) => !prev)}
          circular
        />
        {showConsequenceDashboard && <ConsequenceDashboard trainingMetrics={trainingMetrics} />}
      </Flex>
    </Flex>
  );
};

/**
 * Retrun a string which contains all logs get from server during training
 * @param trainingLog The log get from the api export
 */
const useAllTrainingLog = (trainingLog: string): string => {
  const [allLogs, setAllLogs] = useState(trainingLog);
  useEffect(() => {
    setAllLogs((prev) => `${prev}\n${trainingLog}`);
  }, [trainingLog]);
  return allLogs;
};

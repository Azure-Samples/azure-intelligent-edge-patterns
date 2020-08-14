import React, { useEffect, useState } from 'react';
import { Flex, Text, Alert } from '@fluentui/react-northstar';
import { useDispatch, useSelector } from 'react-redux';

import { State } from 'RootStateType';
import { useInterval } from '../../hooks/useInterval';
import {
  thunkGetTrainingLog,
  thunkGetTrainingMetrics,
  thunkGetInferenceMetrics,
  thunkDeleteProject,
} from '../../store/project/projectActions';
import { Project, Status as CameraConfigStatus } from '../../store/project/projectTypes';
import { LiveViewContainer } from '../LiveViewContainer';
import { InferenceMetricDashboard } from './InferenceMetricDashboard';
import { Button } from '../Button';
import { ConsequenceDashboard } from './ConsequenceDashboard';
import { AOIData } from '../../type';
import { Camera } from '../../store/camera/cameraTypes';
import { ProgressBar } from '../ProgressBar';

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

export const LiveViewDashboard: React.FC<{ isDemo: boolean }> = ({ isDemo }) => {
  const {
    error,
    trainingLogs,
    status,
    trainingMetrics,
    data: { id: projectId, camera: projectCameraId },
    progress,
  } = useSelector<State, Project>((state) => (isDemo ? state.demoProject : state.project));
  const dispatch = useDispatch();
  const [showConsequenceDashboard, setShowConsequenceDashboard] = useState(false);

  useInterval(
    () => {
      dispatch(thunkGetTrainingLog(projectId, isDemo));
    },
    status === CameraConfigStatus.WaitTraining ? 5000 : null,
  );

  useEffect(() => {
    if (status === CameraConfigStatus.FinishTraining) {
      dispatch(thunkGetTrainingMetrics(projectId, isDemo));
    }
  }, [dispatch, status, projectId, isDemo]);

  useInterval(
    () => {
      dispatch(thunkGetInferenceMetrics(projectId, isDemo));
    },
    status === CameraConfigStatus.StartInference ? 5000 : null,
  );

  const onDeleteProject = (): void => {
    dispatch(thunkDeleteProject(isDemo));
  };

  // FIXME Integrate this with Redux
  const cameras = useSelector<State, Camera[]>((state) => state.cameras);
  const selectedCamera = cameras.find((cam) => cam.id === projectCameraId);

  if (status === CameraConfigStatus.None) return null;

  const aoiData = getAOIData(selectedCamera?.area);

  if (status === CameraConfigStatus.WaitTraining)
    return (
      <div style={{ width: '600px' }}>
        {progress !== null && <ProgressBar percentage={progress} />}
        <pre>{trainingLogs.join('\n')}</pre>
      </div>
    );

  return (
    <Flex column gap="gap.medium" styles={{ height: '100%' }}>
      <Flex column style={{ height: '100%' }} gap="gap.small">
        {error && <Alert danger header={error.name} content={`${error.message}`} />}
        <div style={{ flexGrow: 2 }}>
          <LiveViewContainer showVideo={true} cameraId={projectCameraId} onDeleteProject={onDeleteProject} />
        </div>
        <InferenceMetricDashboard isDemo={isDemo} />
      </Flex>
      {!isDemo && (
        <>
          <Flex hAlign="center" column gap="gap.small">
            <Text weight="bold">Detail of Training Metric</Text>
            <Button
              content={showConsequenceDashboard ? 'Hide' : 'Show'}
              primary
              onClick={(): void => setShowConsequenceDashboard((prev) => !prev)}
              circular
            />
            <ConsequenceDashboard visible={showConsequenceDashboard} trainingMetrics={trainingMetrics} />
          </Flex>
        </>
      )}
    </Flex>
  );
};

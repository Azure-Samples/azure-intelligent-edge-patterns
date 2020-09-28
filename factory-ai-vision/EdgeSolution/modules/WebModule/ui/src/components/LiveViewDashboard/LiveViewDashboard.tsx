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
import { ProgressBar } from '../ProgressBar';
import { highLightTextStyles } from './style';

export const LiveViewDashboard: React.FC<{ isDemo: boolean }> = ({ isDemo }) => {
  const {
    error,
    trainingLogs,
    status,
    trainingMetrics,
    data: { id: projectId, camera: projectCameraId },
    progress,
    inferenceMetrics: { partCount },
  } = useSelector<State, Project>((state) => (isDemo ? state.demoProject : state.project));
  const dispatch = useDispatch();
  const [showConsequenceDashboard, setShowConsequenceDashboard] = useState(false);
  const [showDetectedPartsCount, setShowshowDetectedPartsCount] = useState(false);

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

  if (status === CameraConfigStatus.None) return null;

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
      <Flex space="evenly">
        {!isDemo && (
          <>
            <Flex hAlign="center" column gap="gap.small" styles={{ width: '60%' }}>
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
        <Flex column hAlign="center" gap="gap.small" styles={{ width: '40%' }}>
          <Text weight="bold">
            No. of{' '}
            {Object.keys(partCount)
              .map((e) => `${e} part`)
              .join(', ')}{' '}
            detected
          </Text>
          <Button
            content={showDetectedPartsCount ? 'Hide' : 'Show'}
            primary
            onClick={(): void => setShowshowDetectedPartsCount((prev) => !prev)}
            circular
          />
          {showDetectedPartsCount && (
            <Flex column hAlign="center">
              {Object.entries(partCount).map((e) => (
                <>
                  <Text>{e[0]}</Text>
                  <Text styles={highLightTextStyles}>{e[1]}</Text>
                </>
              ))}
            </Flex>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};

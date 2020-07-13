import React, { useEffect, FC, useState } from 'react';
import { Flex, Text, Loader, Alert } from '@fluentui/react-northstar';
import { useDispatch, useSelector } from 'react-redux';

import { useInterval } from '../../hooks/useInterval';
import {
  thunkGetTrainingLog,
  thunkGetTrainingMetrics,
  thunkGetInferenceMetrics,
  resetStatus,
} from '../../store/project/projectActions';
import { Project, Status as CameraConfigStatus, TrainingMetrics } from '../../store/project/projectTypes';
import { State } from '../../store/State';
import { LiveViewContainer } from '../LiveViewContainer';
import { InferenceMetricDashboard } from './InferenceMetricDashboard';
import { Button } from '../Button';

export const LiveViewDashboard: React.FC<{ projectId: number }> = ({ projectId }) => {
  const { error, trainingLog, status, trainingMetrics } = useSelector<State, Project>(
    (state) => state.project,
  );
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
      dispatch(resetStatus());
    };
  }, [dispatch]);

  if (status === CameraConfigStatus.WaitTraining || status === CameraConfigStatus.None)
    return (
      <>
        <Loader size="smallest" />
        <pre>{allTrainingLog}</pre>
      </>
    );

  return (
    <Flex column gap="gap.medium" styles={{ height: '100%' }}>
      <Flex column style={{ height: '100%' }}>
        {error && <Alert danger header={error.name} content={`${error.message}`} />}
        <div style={{ flexGrow: 2 }}>
          <LiveViewContainer showVideo={true} initialAOIData={{ useAOI: false, AOIs: [] }} cameraId={0} />
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

interface ConsequenceDashboardProps {
  trainingMetrics: TrainingMetrics;
}
const ConsequenceDashboard: FC<ConsequenceDashboardProps> = ({
  trainingMetrics: { curConsequence, prevConsequence },
}) => {
  return (
    <table style={{ textAlign: 'center', width: '60%' }}>
      <tr>
        <td style={{ width: '200px' }}></td>
        <td>Precision</td>
        <td>Recall</td>
        <td>mAP</td>
      </tr>
      <tr>
        <td>Updated Model Metrics</td>
        <td style={{ color: '#9a0089' }}>
          {curConsequence?.precision === null ? '' : `${((curConsequence?.precision * 1000) | 0) / 10}%`}
        </td>
        <td style={{ color: '#0063b1' }}>
          {curConsequence?.recall === null ? '' : `${((curConsequence?.recall * 1000) | 0) / 10}%`}
        </td>
        <td style={{ color: '#69c138' }}>
          {curConsequence?.mAP === null ? '' : `${((curConsequence?.mAP * 1000) | 0) / 10}%`}
        </td>
      </tr>
      {prevConsequence && (
        <tr>
          <td>Previous Model Metrics</td>
          <td style={{ color: '#9a0089' }}>
            {prevConsequence?.precision === null ? '' : `${((prevConsequence?.precision * 1000) | 0) / 10}%`}
          </td>
          <td style={{ color: '#0063b1' }}>
            {prevConsequence?.recall === null ? '' : `${((prevConsequence?.recall * 1000) | 0) / 10}%`}
          </td>
          <td style={{ color: '#69c138' }}>
            {prevConsequence?.mAP === null ? '' : `${((prevConsequence?.mAP * 1000) | 0) / 10}%`}
          </td>
        </tr>
      )}
    </table>
  );
};

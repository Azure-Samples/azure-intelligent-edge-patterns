import React, { useEffect, FC, useState, useCallback } from 'react';
import { Flex, Text, Button, Loader, Grid, Alert, Input } from '@fluentui/react-northstar';
import { Link, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { useInterval } from '../../hooks/useInterval';
import {
  thunkDeleteProject,
  thunkGetTrainingLog,
  thunkGetTrainingMetrics,
  thunkGetInferenceMetrics,
  resetStatus,
  updateProjectData,
  thunkUpdateProbThreshold,
  thunkUpdateAccuracyRange,
} from '../../store/project/projectActions';
import { Project, Status as CameraConfigStatus, TrainingMetrics } from '../../store/project/projectTypes';
import { State } from '../../store/State';
import { useQuery } from '../../hooks/useQuery';
import { ListItem } from '../CameraDetails/CameraDetailInfo';

export const CameraConfigureInfoContainer: React.FC<{ projectId: number }> = ({ projectId }) => {
  return (
    <Flex column gap="gap.large">
      <h1>Configuration</h1>
      <CameraConfigureInfo projectId={projectId} />
    </Flex>
  );
};

const CameraConfigureInfo: React.FC<{ projectId: number }> = ({ projectId }) => {
  const {
    error,
    trainingLog,
    status,
    trainingMetrics,
    isLoading,
    inferenceMetrics,
    data: project,
  } = useSelector<State, Project>((state) => state.project);
  const allTrainingLog = useAllTrainingLog(trainingLog);
  const dispatch = useDispatch();
  const cameraName = useQuery().get('name');
  const isDemo = useQuery().get('isDemo') === 'true';
  const history = useHistory();
  const [showConsequenceDashboard, setShowConsequenceDashboard] = useState(false);

  const onDeleteConfigure = useCallback((): void => {
    // eslint-disable-next-line no-restricted-globals
    const sureDelete = confirm('Delete this configuration?');
    if (!sureDelete) return;
    const result = (dispatch(thunkDeleteProject(projectId)) as unknown) as Promise<any>;
    result
      .then((data) => {
        if (data) return history.push(`/cameras/detail?name=${cameraName}`);
        return void 0;
      })
      .catch((err) => console.error(err));
  }, [dispatch, history, cameraName, projectId]);

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
    return () => dispatch(resetStatus());
  }, []);

  if (status === CameraConfigStatus.WaitTraining || status === CameraConfigStatus.None)
    return (
      <>
        <Loader size="smallest" />
        <pre>{allTrainingLog}</pre>
      </>
    );

  return (
    <>
      {error && <Alert danger header={error.name} content={`${error.message}`} />}
      <ListItem title="Maximum">
        <Input
          value={project.probThreshold}
          onChange={(_, { value }): void => {
            dispatch(updateProjectData({ probThreshold: value }));
          }}
        />
        <span>%</span>
        <Button
          primary
          content="Update Confidence Level"
          onClick={(): void => {
            dispatch(thunkUpdateProbThreshold());
          }}
          disabled={!project.probThreshold || isLoading}
          loading={isLoading}
        />
      </ListItem>
      <Grid columns={2} styles={{ rowGap: '20px' }}>
        <ListItem title="Success Rate">
          <Text styles={{ color: 'rgb(244, 152, 40)', fontWeight: 'bold' }} size="medium">
            {`${inferenceMetrics.successRate}%`}
          </Text>
        </ListItem>
        <ListItem title={`Running on ${inferenceMetrics.isGpu ? 'GPU' : 'CPU'} (accelerated)`}>
          {`${Math.round(inferenceMetrics.averageTime * 100) / 100}/ms`}
        </ListItem>
        <ListItem title="Successful Inferences">{inferenceMetrics.successfulInferences}</ListItem>
      </Grid>
      <ListItem title="Unidentified Items">
        <Text styles={{ margin: '5px' }} size="medium">
          {inferenceMetrics.unIdetifiedItems}
        </Text>
        <Button
          content="Identify Manually"
          primary
          styles={{
            backgroundColor: 'red',
            marginLeft: '100px',
            ':hover': {
              backgroundColor: '#A72037',
            },
            ':active': {
              backgroundColor: '#8E192E',
            },
          }}
          as={Link}
          to="/manual"
        />
      </ListItem>
      <Text>Accuracy Range: </Text>
      <Flex gap="gap.medium" vAlign="center">
        <Text>Minimum:</Text>
        <Input
          value={project.accuracyRangeMin}
          type="number"
          onChange={(_, { value }): void => {
            dispatch(updateProjectData({ accuracyRangeMin: parseInt(value, 10) }));
          }}
        />
        <Text>%</Text>
        <Text>Maximum:</Text>
        <Input
          value={project.accuracyRangeMax}
          type="number"
          onChange={(_, { value }): void => {
            dispatch(updateProjectData({ accuracyRangeMax: parseInt(value, 10) }));
          }}
        />
        <Text>%</Text>
        <Button
          content="Update Accuracy Range"
          primary
          loading={isLoading}
          disabled={isLoading}
          onClick={(): void => {
            dispatch(thunkUpdateAccuracyRange());
          }}
        />
      </Flex>
      <Flex hAlign="center" column gap="gap.large" styles={{ paddingTop: '70px' }}>
        <Button
          content={
            showConsequenceDashboard ? 'Hide detail for training metric' : 'Show detail training metric'
          }
          primary
          onClick={(): void => setShowConsequenceDashboard((prev) => !prev)}
        />
        {showConsequenceDashboard && <ConsequenceDashboard trainingMetrics={trainingMetrics} />}
      </Flex>
      <Flex gap="gap.medium" styles={{ marginTop: 'auto' }} hAlign="center">
        <Button primary as={Link} to="/partIdentification">
          Edit Configuration
        </Button>
        <Button primary disabled={isDemo} onClick={onDeleteConfigure}>
          Delete Configuration
        </Button>
      </Flex>
    </>
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

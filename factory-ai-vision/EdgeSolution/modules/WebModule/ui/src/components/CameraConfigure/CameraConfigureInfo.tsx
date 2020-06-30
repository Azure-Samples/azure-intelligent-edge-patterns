import React, { useEffect, FC, useState, useCallback } from 'react';
import { Flex, Text, Status, Button, Loader, Grid, Alert } from '@fluentui/react-northstar';
import { Link, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { useInterval } from '../../hooks/useInterval';
import {
  thunkDeleteProject,
  thunkGetTrainingLog,
  thunkGetTrainingMetrics,
  thunkGetInferenceMetrics,
  resetStatus,
} from '../../store/project/projectActions';
import { Project, Status as CameraConfigStatus } from '../../store/project/projectTypes';
import { State } from '../../store/State';
import { useParts } from '../../hooks/useParts';
import { useQuery } from '../../hooks/useQuery';
import { LiveViewContainer } from '../LiveViewContainer';
import { AOIData } from '../../type';

export const CameraConfigureInfo: React.FC<{ projectId: number; AOIs: AOIData }> = ({ projectId, AOIs }) => {
  const { error, data: project, trainingLog, status, trainingMetrics, inferenceMetrics } = useSelector<
    State,
    Project
  >((state) => state.project);
  const allTrainingLog = useAllTrainingLog(trainingLog);
  const parts = useParts();
  const dispatch = useDispatch();
  const cameraName = useQuery().get('name');
  const isDemo = useQuery().get('isDemo') === 'true';
  const history = useHistory();

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

  const isCameraOnline = [CameraConfigStatus.FinishTraining, CameraConfigStatus.StartInference].includes(
    status,
  );

  return (
    <Flex column gap="gap.large">
      <h1>Configuration</h1>
      {error && <Alert danger header={error.name} content={`${error.message}`} />}
      {status === CameraConfigStatus.WaitTraining || status === CameraConfigStatus.None ? (
        <>
          <Loader size="smallest" />
          <pre>{allTrainingLog}</pre>
        </>
      ) : (
        <>
          <ListItem title="Status">
            <CameraStatus online={isCameraOnline} />
          </ListItem>
          <ListItem title="Configured for">
            {parts
              .filter((e) => project.parts.includes(e.id))
              .map((e) => e.name)
              .join(', ')}
          </ListItem>
          <Flex column gap="gap.small">
            <LiveViewContainer showVideo={true} initialAOIData={AOIs} cameraId={project.camera} />
          </Flex>
          <Grid columns={2} styles={{ rowGap: '20px' }}>
            <ListItem title="Success Rate">
              <Text styles={{ color: 'rgb(244, 152, 40)', fontWeight: 'bold' }} size="large">
                {`${inferenceMetrics.successRate}%`}
              </Text>
            </ListItem>
            <ListItem title={`Running on ${inferenceMetrics.isGpu ? 'GPU' : 'CPU'} (accelerated)`}>{`${
              Math.round(inferenceMetrics.averageTime * 100) / 100
            }/ms`}</ListItem>
            <ListItem title="Successful Inferences">{inferenceMetrics.successfulInferences}</ListItem>
          </Grid>
          <ListItem title="Unidentified Items">
            <Text styles={{ margin: '5px' }} size="large">
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
          {trainingMetrics.prevConsequence && (
            <>
              <Text>Previous Model Metrics</Text>
              <ConsequenceDashboard
                precision={trainingMetrics.prevConsequence?.precision}
                recall={trainingMetrics.prevConsequence?.recall}
                mAP={trainingMetrics.prevConsequence?.mAP}
              />
            </>
          )}
          <Text>Updated Model Metrics</Text>
          <ConsequenceDashboard
            precision={trainingMetrics.curConsequence?.precision}
            recall={trainingMetrics.curConsequence?.recall}
            mAP={trainingMetrics.curConsequence?.mAP}
          />
          <Button primary disabled={isDemo} onClick={onDeleteConfigure}>
            Delete Configuration
          </Button>
          <Button primary as={Link} to="/partIdentification">
            Edit Configuration
          </Button>
        </>
      )}
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
  precision: number;
  recall: number;
  mAP: number;
}
const ConsequenceDashboard: FC<ConsequenceDashboardProps> = ({ precision, recall, mAP }) => {
  return (
    <Grid columns={3}>
      <div style={{ height: '5em', display: 'flex', flexFlow: 'column', justifyContent: 'space-between' }}>
        <Text align="center" size="large" weight="semibold">
          Precision
        </Text>
        <Text align="center" size="large" weight="semibold" styles={{ color: '#9a0089' }}>
          {precision === null ? '' : `${((precision * 1000) | 0) / 10}%`}
        </Text>
      </div>
      <div style={{ height: '5em', display: 'flex', flexFlow: 'column', justifyContent: 'space-between' }}>
        <Text align="center" size="large" weight="semibold">
          Recall
        </Text>
        <Text align="center" size="large" weight="semibold" styles={{ color: '#0063b1' }}>
          {recall === null ? '' : `${((recall * 1000) | 0) / 10}%`}
        </Text>
      </div>
      <div style={{ height: '5em', display: 'flex', flexFlow: 'column', justifyContent: 'space-between' }}>
        <Text align="center" size="large" weight="semibold">
          mAP
        </Text>
        <Text align="center" size="large" weight="semibold" styles={{ color: '#69c138' }}>
          {mAP === null ? '' : `${((mAP * 1000) | 0) / 10}%`}
        </Text>
      </div>
    </Grid>
  );
};

const ListItem = ({ title, children }): JSX.Element => {
  return (
    <Flex vAlign="center">
      <Text style={{ width: '200px' }} size="large">{`${title}: `}</Text>
      {typeof children === 'string' || typeof children === 'number' ? (
        <Text size="large">{children}</Text>
      ) : (
        children
      )}
    </Flex>
  );
};

const CameraStatus = ({ online }): JSX.Element => {
  const text = online ? 'Online' : 'Offline';
  const state = online ? 'success' : 'unknown';

  return (
    <Flex gap="gap.smaller" vAlign="center">
      <Status state={state} />
      <Text styles={{ margin: '5px' }} size="large">
        {text}
      </Text>
    </Flex>
  );
};

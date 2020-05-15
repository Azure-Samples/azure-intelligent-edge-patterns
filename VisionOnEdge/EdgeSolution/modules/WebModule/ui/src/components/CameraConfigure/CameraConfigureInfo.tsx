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
  startInference,
  stopInference,
} from '../../store/project/projectActions';
import { Project, Status as CameraConfigStatus } from '../../store/project/projectTypes';
import { State } from '../../store/State';
import { Camera } from '../../store/camera/cameraTypes';
import { RTSPVideo } from '../RTSPVideo';
import { useParts } from '../../hooks/useParts';
import { useQuery } from '../../hooks/useQuery';

export const CameraConfigureInfo: React.FC<{ camera: Camera; projectId: number }> = ({
  camera,
  projectId,
}) => {
  const { error, data: project, trainingLog, status, trainingMetrics, inferenceMetrics } = useSelector<
    State,
    Project
  >((state) => state.project);
  const [trainingInfo, setTrainingInfo] = useState(trainingLog);
  const parts = useParts();
  const dispatch = useDispatch();
  const name = useQuery().get('name');
  const history = useHistory();

  const onDeleteConfigure = useCallback((): void => {
    // eslint-disable-next-line no-restricted-globals
    const sureDelete = confirm('Delete this configuration?');
    if (!sureDelete) return;
    const result = (dispatch(thunkDeleteProject(projectId)) as unknown) as Promise<any>;
    result
      .then((data) => {
        if (data) return history.push(`/cameras/detail?name=${name}`);
        return void 0;
      })
      .catch((err) => console.error(err));
  }, [dispatch, history, name, projectId]);

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
    setTrainingInfo((prev) => `${prev}\n${trainingLog}`);
  }, [trainingLog]);

  useEffect(() => {
    if (status === CameraConfigStatus.FinishTraining || status === CameraConfigStatus.TrainingFailed) {
      dispatch(thunkGetTrainingMetrics(projectId));
    }
  }, [dispatch, status, projectId]);

  useInterval(
    () => {
      dispatch(thunkGetInferenceMetrics(projectId));
    },
    status === CameraConfigStatus.StartInference ? 5000 : null,
  );

  const onVideoStart = (): void => {
    dispatch(startInference());
  };

  const onVideoPause = (): void => {
    dispatch(stopInference());
  };

  return (
    <Flex column gap="gap.large">
      <h1>Configuration</h1>
      {error && <Alert danger header={error.name} content={`${error.message}`} />}
      {trainingLog ? (
        <>
          <Loader size="smallest" />
          <pre>{trainingInfo}</pre>
        </>
      ) : (
        <>
          <ListItem title="Status">
            <CameraStatus
              online={[
                CameraConfigStatus.FinishTraining,
                CameraConfigStatus.PendInference,
                CameraConfigStatus.StartInference,
              ].includes(status)}
            />
          </ListItem>
          <ListItem title="Configured for">
            {parts
              .filter((e) => project.parts.includes(e.id))
              .map((e) => e.name)
              .join(', ')}
          </ListItem>
          <Flex column gap="gap.small">
            <Text styles={{ width: '150px' }} size="large">
              Live View:
            </Text>
            <RTSPVideo
              rtsp={camera.rtsp}
              partId={project.parts[0]}
              canCapture={false}
              onVideoStart={onVideoStart}
              onVideoPause={onVideoPause}
            />
          </Flex>
          <ListItem title="Success Rate">
            <Text styles={{ color: 'rgb(244, 152, 40)', fontWeight: 'bold' }} size="large">
              {`${inferenceMetrics.successRate}%`}
            </Text>
          </ListItem>
          <ListItem title="Successful Inferences">{inferenceMetrics.successfulInferences}</ListItem>
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
          <Button primary onClick={onDeleteConfigure}>
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
          Precison
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

import React, { FC, memo, useState } from 'react';
import { Flex, Text, Grid, Button, Status, Input } from '@fluentui/react-northstar';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import ConfirmDialog from '../ConfirmDialog';
import { deleteCamera } from '../../store/camera/cameraActions';
import { State } from '../../store/State';
import { Project, Status as CameraConfigStatus } from '../../store/project/projectTypes';
import { useParts } from '../../hooks/useParts';
import { LiveViewContainer } from '../LiveViewContainer';
import { updateProjectData, thunkUpdateProbThreshold } from '../../store/project/projectActions';
import { AOIData } from '../../type';

interface CameraDetailInfoProps {
  AOIs: AOIData;
  name: string;
  rtsp: string;
  id: number;
}
const CameraDetailInfo: FC<CameraDetailInfoProps> = ({ id, name, rtsp, AOIs }) => {
  const [showTestResult, setShowTestResult] = useState(false);
  const dispatch = useDispatch();

  const { data: project, inferenceMetrics, isLoading, status } = useSelector<State, Project>(
    (state) => state.project,
  );
  const parts = useParts();

  const isCameraOnline = [CameraConfigStatus.FinishTraining, CameraConfigStatus.StartInference].includes(
    status,
  );

  return (
    <Flex styles={{ padding: '1em 2em' }} column gap="gap.medium">
      <h1>Details</h1>
      <Grid columns="2" styles={{ gap: '3em' }}>
        <Flex column gap="gap.medium">
          <Text size="medium" content={`Name: ${name}`} />
          <Text size="medium" content={`RTSP Url: ${rtsp}`} />
        </Flex>
        <ConfirmDialog
          trigger={
            <Button
              primary
              content="Delete Camera"
              styles={{
                backgroundColor: '#C4314B',
                ':hover': { backgroundColor: '#A72037' },
                ':active': { backgroundColor: '#8E192E' },
              }}
            />
          }
          content="Delete Camera"
          primaryStyles={{
            backgroundColor: '#C4314B',
            ':hover': { backgroundColor: '#A72037' },
            ':active': { backgroundColor: '#8E192E' },
          }}
          onConfirm={(): void => {
            dispatch(deleteCamera(id));
          }}
        />
      </Grid>
      {status !== CameraConfigStatus.WaitTraining && status !== CameraConfigStatus.None && (
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
            <Button
              content={showTestResult ? 'Back to Video' : 'Test Result'}
              primary
              onClick={(): void => setShowTestResult((prev) => !prev)}
            />
          </ListItem>
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
        </>
      )}
    </Flex>
  );
};

const ListItem = ({ title, children }): JSX.Element => {
  return (
    <Flex vAlign="center" gap="gap.medium">
      <Text style={{ width: '200px' }} size="medium">{`${title}: `}</Text>
      {typeof children === 'string' || typeof children === 'number' ? (
        <Text size="medium">{children}</Text>
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
      <Text styles={{ margin: '5px' }} size="medium">
        {text}
      </Text>
    </Flex>
  );
};

export default memo(CameraDetailInfo);

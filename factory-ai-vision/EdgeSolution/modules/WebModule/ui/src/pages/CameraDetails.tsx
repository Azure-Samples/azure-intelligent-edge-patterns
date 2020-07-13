import React, { FC } from 'react';
import { Redirect } from 'react-router-dom';
import { Grid, Flex, Divider, Text } from '@fluentui/react-northstar';
import { useSelector, useDispatch } from 'react-redux';

import { Camera } from '../store/camera/cameraTypes';
import { State } from '../store/State';
import { useQuery } from '../hooks/useQuery';
import { RTSPVideo } from '../components/RTSPVideo';
import { CreateButton } from '../components/CreateButton';

const infoDivStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-evenly',
  alignItems: 'center',
  height: '100%',
  width: '25%',
  overflow: 'scroll',
};

const CameraDetails: FC = (): JSX.Element => {
  const dispatch = useDispatch();
  const name = useQuery().get('name');
  const camera = useSelector<State, Camera>((state) => state.cameras.find((ele) => ele.name === name));

  if (!camera) return <Redirect to="/cameras" />;

  return (
    <Grid columns="70% 30%" rows="100px auto" design={{ height: '100%' }}>
      <Flex hAlign="center">
        <div style={infoDivStyle}>
          <Text content="Name" weight="bold" />
          <Text content={camera.name} />
        </div>
        <Divider vertical color="black" styles={{ height: '80px' }} />
        <div style={infoDivStyle}>
          <Text content="Camera URL" weight="bold" />
          <Text content={camera.rtsp} />
        </div>
      </Flex>
      <section style={{ width: '100%', height: '100%', gridColumn: '1 / span 1', gridRow: '2 / span 1' }}>
        <RTSPVideo rtsp={camera.rtsp} canCapture={false} autoPlay={true} partId={1} />
      </section>
      <Flex
        style={{ gridColumn: '2 / span 1', gridRow: '1 / span 2' }}
        gap="gap.medium"
        vAlign="center"
        hAlign="center"
      >
        <CreateButton title="Configure Task" onClick={() => {}} />
        <Divider color="black" vertical styles={{ height: '150px' }} />
        <CreateButton title="Create Parts" onClick={() => {}} />
      </Flex>
    </Grid>
  );
};

export default CameraDetails;

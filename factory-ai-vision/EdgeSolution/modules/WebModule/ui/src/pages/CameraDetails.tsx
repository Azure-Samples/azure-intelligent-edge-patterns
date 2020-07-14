import React, { FC, useState } from 'react';
import { Redirect, useHistory } from 'react-router-dom';
import { Grid, Flex, Divider, Text, Provider } from '@fluentui/react-northstar';
import { useSelector, useDispatch } from 'react-redux';

import { Camera } from '../store/camera/cameraTypes';
import { State } from '../store/State';
import { useQuery } from '../hooks/useQuery';
import { RTSPVideo } from '../components/RTSPVideo';
import { CreateButton } from '../components/CreateButton';
import { errorTheme } from '../themes/errorTheme';
import { WarningDialog } from '../components/WarningDialog';
import { LoadingDialog, Status } from '../components/LoadingDialog/LoadingDialog';
import { Button } from '../components/Button';
import { deleteCamera } from '../store/camera/cameraActions';

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
  const camerId = useQuery().get('cameraId');
  const camera = useSelector<State, Camera>((state) =>
    state.cameras.find((ele) => ele.id === parseInt(camerId, 10)),
  );
  const [status, setStatus] = useState<Status>(Status.None);
  const history = useHistory();

  if (!camera) return <Redirect to="/cameras" />;

  const onDelete = async (): Promise<void> => {
    setStatus(Status.Loading);
    try {
      await dispatch(deleteCamera(camera.id));
      setStatus(Status.Success);
    } catch (e) {
      setStatus(Status.Failed);
    }
  };

  return (
    <Grid columns="70% 30%" rows="100px auto" design={{ height: '100%' }}>
      <Flex hAlign="center">
        <div style={infoDivStyle}>
          <Text content="Name" weight="bold" />
          <Text content={camera.name} />
          <Provider theme={errorTheme}>
            <WarningDialog
              contentText={
                <p>
                  Sure you want to delete the camera <b>{camera.name}</b>?
                </p>
              }
              trigger={<Button content="Delete Camera" primary circular />}
              onConfirm={onDelete}
            />
          </Provider>
          <LoadingDialog status={status} />
        </div>
        <Divider vertical color="black" styles={{ height: '80px' }} />
        <div style={infoDivStyle}>
          <Text content="Camera URL" weight="bold" />
          <Text content={camera.rtsp} />
        </div>
      </Flex>
      <section style={{ width: '100%', height: '100%', gridColumn: '1 / span 1', gridRow: '2 / span 1' }}>
        <RTSPVideo rtsp={camera.rtsp} canCapture={false} autoPlay={true} />
      </section>
      <Flex
        style={{ gridColumn: '2 / span 1', gridRow: '1 / span 2' }}
        gap="gap.medium"
        vAlign="center"
        hAlign="center"
      >
        <CreateButton
          title="Configure Task"
          onClick={(): void => {
            history.push(`/partIdentification?cameraId=${camera.id}`);
          }}
        />
        <Divider color="black" vertical styles={{ height: '150px' }} />
        <CreateButton
          title="Create Parts"
          onClick={(): void => {
            history.push(`/parts/`);
          }}
        />
      </Flex>
    </Grid>
  );
};

export default CameraDetails;

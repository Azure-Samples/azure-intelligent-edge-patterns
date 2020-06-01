/* eslint-disable @typescript-eslint/camelcase */
import React, { useState, useEffect, FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Flex, Button, Dialog, Input, Grid, AddIcon } from '@fluentui/react-northstar';

import { postCamera, getCameras } from '../store/camera/cameraActions';
import ImageLink from '../components/ImageLink';
import { State } from '../store/State';
import { closeDialog, openDialog } from '../store/dialog/dialogIsOpenActions';
import { Camera } from '../store/camera/cameraTypes';

const Cameras: FC = (): JSX.Element => {
  const dispatch = useDispatch();
  const { dialogIsOpen, cameras } = useSelector<State, { dialogIsOpen: boolean; cameras: Camera[] }>(
    (state) => ({ dialogIsOpen: state.dialogIsOpen, cameras: state.cameras }),
  );

  const [name, setName] = useState<string>('');
  const [rtsp, setRtsp] = useState<string>('');
  const [model_name, setModel_name] = useState<string>('');

  useEffect(() => {
    dispatch(getCameras());
  }, [dispatch]);

  return (
    <Flex column gap="gap.large" padding="padding.medium" styles={{ height: '100%' }}>
      <Grid columns="8" styles={{ height: '75%' }}>
        {cameras.map((camera, i) => (
          <ImageLink
            key={i}
            to={`/cameras/detail?name=${camera.name}`}
            defaultSrc="/icons/Play.png"
            bgImgSrc="/icons/defaultCamera.png"
            width="100px"
            height="100px"
            bgImgStyle={{
              backgroundSize: '60%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
            label={camera.name}
          />
        ))}
      </Grid>
      <Dialog
        trigger={
          <Flex hAlign="end">
            <Button
              primary
              fluid
              circular
              content={<AddIcon size="largest" circular />}
              style={{ width: '6em', height: '6em' }}
            />
          </Flex>
        }
        confirmButton="Submit"
        onConfirm={(): void => {
          dispatch(postCamera({ name, rtsp, model_name }));
          setName('');
          setRtsp('');
          setModel_name('');
          dispatch(closeDialog());
        }}
        cancelButton="Cancel"
        header="Add Camera"
        open={dialogIsOpen}
        onOpen={(): void => {
          dispatch(openDialog());
        }}
        onCancel={(): void => {
          dispatch(closeDialog());
        }}
        content={
          <Flex column gap="gap.small">
            <Input
              placeholder="Name"
              value={name}
              onChange={(_, newProps): void => setName(newProps.value)}
            />
            <Input
              placeholder="RTSP URL"
              value={rtsp}
              onChange={(_, newProps): void => setRtsp(newProps.value)}
            />
            <Input
              placeholder="Model Name"
              value={model_name}
              onChange={(_, newProps): void => setModel_name(newProps.value)}
            />
          </Flex>
        }
      />
    </Flex>
  );
};

export default Cameras;

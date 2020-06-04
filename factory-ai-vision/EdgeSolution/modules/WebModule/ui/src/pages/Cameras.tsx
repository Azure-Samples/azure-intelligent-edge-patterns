/* eslint-disable @typescript-eslint/camelcase */
import React, { useState, useEffect, FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Text, Dialog, Input, Grid, Button } from '@fluentui/react-northstar';

import { postCamera, getCameras } from '../store/camera/cameraActions';
import ImageLink from '../components/ImageLink';
import { State } from '../store/State';
import { closeDialog, openDialog } from '../store/dialog/dialogIsOpenActions';
import { Camera } from '../store/camera/cameraTypes';
import AddButton from '../components/AddButton';

const Cameras: FC = (): JSX.Element => {
  const dispatch = useDispatch();
  const { dialogIsOpen, cameras } = useSelector<State, { dialogIsOpen: boolean; cameras: Camera[] }>(
    (state) => ({ dialogIsOpen: state.dialogIsOpen, cameras: state.cameras.filter((e) => !e.is_demo) }),
  );

  const [name, setName] = useState<string>('');
  const [rtsp, setRtsp] = useState<string>('');
  const [model_name, setModel_name] = useState<string>('');

  useEffect(() => {
    dispatch(getCameras());
  }, [dispatch]);

  return (
    <div
      style={{
        display: 'flex',
        flexFlow: 'column',
        justifyContent: 'space-between',
        padding: '3em',
        height: '100%',
      }}
    >
      <Grid columns="8" styles={{ height: '75%' }}>
        {cameras.map((camera, i) => (
          <ImageLink
            key={i}
            to={`/cameras/detail?name=${camera.name}`}
            defaultSrc="/icons/Play.png"
            bgImgSrc="/icons/defaultCamera.png"
            width="6.25em"
            height="6.25em"
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
        styles={{ width: '20%', height: '40%', padding: 0, display: 'flex' }}
        open={dialogIsOpen}
        trigger={
          <div style={{ alignSelf: 'flex-end' }}>
            <AddButton
              onClick={(): void => {
                dispatch(openDialog());
              }}
            />
          </div>
        }
        content={
          <div
            style={{
              height: '100%',
              display: 'flex',
              flexFlow: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text size="larger" weight="semibold">
              Add Camera
            </Text>
            <div
              style={{
                display: 'flex',
                flexFlow: 'column',
                height: '50%',
                justifyContent: 'space-around',
              }}
            >
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
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-evenly', width: '100%' }}>
              <Button
                primary
                content="Submit"
                disabled={name === '' || rtsp === '' || model_name === ''}
                onClick={(): void => {
                  dispatch(postCamera({ name, rtsp, model_name, is_demo: false }));
                  setName('');
                  setRtsp('');
                  setModel_name('');
                  dispatch(closeDialog());
                }}
              />
              <Button
                content="Cancel"
                onClick={(): void => {
                  dispatch(closeDialog());
                }}
              />
            </div>
          </div>
        }
      />
    </div>
  );
};

export default Cameras;

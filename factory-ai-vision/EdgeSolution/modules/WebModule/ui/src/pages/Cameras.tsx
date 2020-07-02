/* eslint-disable @typescript-eslint/camelcase */
import React, { useEffect, FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Grid } from '@fluentui/react-northstar';

import { postCamera, getCameras } from '../store/camera/cameraActions';
import ImageLink from '../components/ImageLink';
import { State } from '../store/State';
import { Camera } from '../store/camera/cameraTypes';
import { AddModuleDialog } from '../components/AddModuleDialog/AddModuleDialog';

const Cameras: FC = (): JSX.Element => {
  const dispatch = useDispatch();
  const { cameras } = useSelector<State, { dialogIsOpen: boolean; cameras: Camera[] }>((state) => ({
    dialogIsOpen: state.dialogIsOpen,
    cameras: state.cameras.filter((e) => !e.is_demo),
  }));

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
      <AddModuleDialog
        header="Add Camera"
        fields={[
          {
            placeholder: 'Name',
            key: 'name',
            type: 'input',
            required: true,
          },
          {
            placeholder: 'RTSP URL',
            key: 'rtsp',
            type: 'input',
            required: true,
          },
        ]}
        onConfirm={({ name, rtsp }): void => {
          dispatch(postCamera({ name, rtsp, is_demo: false }));
        }}
      />
    </div>
  );
};

export default Cameras;

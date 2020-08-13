/* eslint-disable @typescript-eslint/camelcase */
import React, { useEffect, FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Grid } from '@fluentui/react-northstar';

import { getCameras, postCamera, selectAllCameras } from '../store/cameraSlice';
import ImageLink from '../components/ImageLink';
import { AddModuleDialog } from '../components/AddModuleDialog/AddModuleDialog';

const Cameras: FC = (): JSX.Element => {
  const dispatch = useDispatch();
  const cameras = useSelector(selectAllCameras);

  useEffect(() => {
    dispatch(getCameras(false));
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
            to={`/cameras/detail?cameraId=${camera.id}`}
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
          dispatch(postCamera({ name, rtsp }));
        }}
      />
    </div>
  );
};

export default Cameras;

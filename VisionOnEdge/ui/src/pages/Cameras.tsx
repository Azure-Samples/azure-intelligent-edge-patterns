import React, { useState, FC } from 'react';
import { useDispatch } from 'react-redux';
import { Flex, Button, Dialog, Input, Grid, AddIcon } from '@fluentui/react-northstar';

import { useCameras } from '../hooks/useCameras';
import { Camera } from '../store/camera/cameraTypes';
import { postCamera } from '../store/camera/cameraActions';
import ImageLink from '../components/ImageLink';

const Cameras: FC = (): JSX.Element => {
  const dispatch = useDispatch();
  const cameras = useCameras();
  const [cameraInput, setCameraInput] = useState<Camera>({ name: '', rtsp: '', model_name: '' });

  return (
    <Flex column gap="gap.large" padding="padding.medium" styles={{ height: '100%' }}>
      <Grid columns="8" styles={{ height: '80%' }}>
        {cameras.map((camera, i) => (
          <ImageLink
            key={i}
            to={`/cameras/${camera.name}`}
            defaultSrc="/Play.png"
            bgImgSrc="/defaultCamera.png"
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
              style={{ width: 100, height: 100 }}
            />
          </Flex>
        }
        confirmButton="Submit"
        onConfirm={(): void => {
          dispatch(postCamera(cameraInput));
        }}
        cancelButton="Cancel"
        header="Add Camera"
        closeOnOutsideClick={false}
        content={
          <Flex column gap="gap.small">
            <Input
              placeholder="Name"
              value={cameraInput.name}
              onChange={(_, newProps): void => setCameraInput((prev) => ({ ...prev, name: newProps.value }))}
            />
            <Input
              placeholder="RTSP URL"
              value={cameraInput.rtsp}
              onChange={(_, newProps): void => setCameraInput((prev) => ({ ...prev, rtsp: newProps.value }))}
            />
            <Input
              placeholder="Model Name"
              value={cameraInput.model_name}
              onChange={(_, newProps): void =>
                setCameraInput((prev) => ({ ...prev, model_name: newProps.value }))
              }
            />
          </Flex>
        }
      />
    </Flex>
  );
};

export default Cameras;

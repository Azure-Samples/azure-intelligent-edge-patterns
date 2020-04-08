import React, { useState, FC } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Text, Flex, Button, Dialog, Input, Image, Icon, FlexItem, Grid } from '@fluentui/react-northstar';

import { postCameras } from '../actions/cameras';
import { Camera } from '../State';
import { useCameras } from '../hooks/useCameras';

const Cameras: FC = (): JSX.Element => {
  const dispatch = useDispatch();
  const cameras = useCameras();
  const [cameraInput, setCameraInput] = useState<Camera>({ name: '', rtsp: '', model_name: '' });

  return (
    <Flex column gap="gap.large" padding="padding.medium">
      <FlexItem align="center">
        <Text size="larger" weight="semibold">
          Camera
        </Text>
      </FlexItem>
      <Grid columns="8">
        {cameras.map((camera, i) => (
          <Flex key={i} column styles={{ maxWidth: '300px', padding: '20px' }}>
            <Link to={`/cameras/${camera.name}`}>
              <Image src="/defaultCamera.png" fluid />
            </Link>
            <Text size="larger" align="center">
              {camera.name}
            </Text>
          </Flex>
        ))}
      </Grid>
      <Dialog
        trigger={
          <Flex hAlign="end">
            <Button
              primary
              fluid
              circular
              content={<Icon name="add" size="largest" circular />}
              style={{ width: 100, height: 100 }}
            />
          </Flex>
        }
        confirmButton="Submit"
        onConfirm={(): void => {
          dispatch(postCameras(cameraInput));
        }}
        cancelButton="Cancel"
        header="Add Camera"
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

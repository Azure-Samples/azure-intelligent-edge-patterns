import React, { useState, useEffect, FC } from 'react';
import { Redirect } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { List, Text, Flex, ListItemProps, Button, Dialog, Input, Image } from '@fluentui/react-northstar';

import { getCameras, postCameras } from '../actions/cameras';
import { State, Camera } from '../State';

const Cameras: FC = (): JSX.Element => {
  const dispatch = useDispatch();
  const cameras: Camera[] = useSelector<State, Camera[]>((state) => state.cameras);
  const [cameraInput, setCameraInput] = useState<Camera>({ name: '', rtsp: '', model_name: '' });
  const [selectedListIdx, setSelectedListIdx] = useState(-1);
  const cameraItems: ListItemProps[] = cameras.map((camera) => ({
    key: camera.id,
    media: <Image src="/defalutCamera.png" avatar />,
    header: camera.name,
    content: `Model Name: ${camera.model_name}`,
  }));

  useEffect(() => {
    dispatch(getCameras());
  }, [dispatch]);

  if (selectedListIdx !== -1)
    return <Redirect to={`/cameras/${cameras[selectedListIdx].name}`} />;

  return (
    <>
      <Flex hAlign="center">
        <Text size="larger" weight="semibold">
          Camera
        </Text>
      </Flex>
      <Dialog
        trigger={
          <Flex hAlign="end" padding="padding.medium">
            <Button content="Add Camera" />
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
      <List
        items={cameraItems}
        selectable
        selectedIndex={selectedListIdx}
        onSelectedIndexChange={(_, newProps): void => {
          setSelectedListIdx(newProps.selectedIndex);
        }}
      />
    </>
  );
};

export default Cameras;

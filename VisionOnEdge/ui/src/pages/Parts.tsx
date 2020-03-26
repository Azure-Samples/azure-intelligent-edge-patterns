import React from 'react';
import { Flex, Input, TextArea, Button, Text, Dropdown, Image, Video, Menu } from '@fluentui/react-northstar';
import { Link } from 'react-router-dom';

export const Parts = (): JSX.Element => {
  return (
    <Flex gap="gap.large" styles={{ height: '100%' }}>
      <LeftPanel />
      <RightPanel />
    </Flex>
  );
};

const LeftPanel = (): JSX.Element => {
  return (
    <Flex column space="around" styles={{ flexGrow: 1 }}>
      <Input fluid styles={{ fontSize: '2em' }} />
      <Flex column gap="gap.small" design={{ height: '80%' }}>
        <Text content="Description" size="medium" />
        <TextArea design={{ height: '100%' }} />
      </Flex>
      <Flex space="around">
        <Button content="Save" primary />
        <Button content="Cancel" />
      </Flex>
    </Flex>
  );
};

const RightPanel = (): JSX.Element => {
  return (
    <Flex column gap="gap.small" styles={{ flexGrow: 3 }}>
      <Tab />
      <CameraSelector />
      <RTSPVideo />
      <CapturedImagesContainer />
    </Flex>
  );
};

const Tab = (): JSX.Element => {
  return <Menu items={['Upload Photos', 'Capture Photo']} pointing primary />;
};

const CameraSelector = (): JSX.Element => {
  // TODO: Get available cameras from server
  const availableCameras = ['camera1', 'camera2', 'camera3', 'camera4'];

  return (
    <Flex gap="gap.small" vAlign="center">
      <Text>Select Camera</Text>
      <Dropdown items={availableCameras} />
      <Link to="/addCamera">Add Camera</Link>
    </Flex>
  );
};

const RTSPVideo = (): JSX.Element => {
  return (
    <>
      <Video
        // autoPlay
        controls={false}
        src="https://raw.githubusercontent.com/bower-media-samples/big-buck-bunny-480p-30s/master/video.mp4"
        design={{ width: '100%' }}
      />
      <Button content="Capture" fluid loader="Generate feed" primary />
    </>
  );
};

const CapturedImagesContainer = (): JSX.Element => {
  const imageSrcs = [
    'https://s3.amazonaws.com/uifaces/faces/twitter/elliotnolten/128.jpg',
    'https://s3.amazonaws.com/uifaces/faces/twitter/elliotnolten/128.jpg',
    'https://s3.amazonaws.com/uifaces/faces/twitter/elliotnolten/128.jpg',
    'https://s3.amazonaws.com/uifaces/faces/twitter/elliotnolten/128.jpg',
    'https://s3.amazonaws.com/uifaces/faces/twitter/elliotnolten/128.jpg',
    'https://s3.amazonaws.com/uifaces/faces/twitter/elliotnolten/128.jpg',
    'https://s3.amazonaws.com/uifaces/faces/twitter/elliotnolten/128.jpg',
    'https://s3.amazonaws.com/uifaces/faces/twitter/elliotnolten/128.jpg',
    'https://s3.amazonaws.com/uifaces/faces/twitter/elliotnolten/128.jpg',
    'https://s3.amazonaws.com/uifaces/faces/twitter/elliotnolten/128.jpg',
    'https://s3.amazonaws.com/uifaces/faces/twitter/elliotnolten/128.jpg',
    'https://s3.amazonaws.com/uifaces/faces/twitter/elliotnolten/128.jpg',
    'https://s3.amazonaws.com/uifaces/faces/twitter/elliotnolten/128.jpg',
    'https://s3.amazonaws.com/uifaces/faces/twitter/elliotnolten/128.jpg',
    'https://s3.amazonaws.com/uifaces/faces/twitter/elliotnolten/128.jpg',
    'https://s3.amazonaws.com/uifaces/faces/twitter/elliotnolten/128.jpg',
    'https://s3.amazonaws.com/uifaces/faces/twitter/elliotnolten/128.jpg',
    'https://s3.amazonaws.com/uifaces/faces/twitter/elliotnolten/128.jpg',
    'https://s3.amazonaws.com/uifaces/faces/twitter/elliotnolten/128.jpg',
    'https://s3.amazonaws.com/uifaces/faces/twitter/elliotnolten/128.jpg',
  ];

  return (
    <Flex styles={{ maxWidth: '1000px', overflow: 'scroll' }}>
      {imageSrcs.map((src, i) => (
        <Image key={i} src={src} />
      ))}
    </Flex>
  );
};

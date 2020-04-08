import React, { useState } from 'react';
import { Flex, Input, TextArea, Button, Menu, Grid } from '@fluentui/react-northstar';
import { Link, useLocation, Switch, Route, Redirect } from 'react-router-dom';
import { CapturePhotos } from '../components/CapturePhoto';

export const PartDetails = (): JSX.Element => {
  return (
    <Grid columns={'repeat(12, 1fr)'} styles={{ gridColumnGap: '20px', height: '100%' }}>
      <LeftPanel />
      <RightPanel />
    </Grid>
  );
};

const LeftPanel = (): JSX.Element => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const onSave = (): void => {
    // TODO
  };

  return (
    <Flex column space="around" styles={{ gridColumn: '1 / span 4' }}>
      <Input
        placeholder="Enter Part Name..."
        fluid
        styles={{ fontSize: '2em' }}
        value={name}
        onChange={(_, newProps): void => {
          setName(newProps.value);
        }}
      />
      <TextArea
        placeholder="Enter Description..."
        design={{ height: '80%' }}
        value={description}
        onChange={(_, newProps): void => {
          setDescription(newProps.value);
        }}
      />
      <Flex space="around">
        <Button content="Save" primary onClick={onSave} />
        <Button content="Cancel" />
      </Flex>
    </Flex>
  );
};

const RightPanel = (): JSX.Element => {
  return (
    <Flex column gap="gap.small" styles={{ gridColumn: '5 / span 8' }}>
      <Tab />
      <Switch>
        <Route path="/parts/capturePhotos" component={CapturePhotos} />
        <Route path="/parts/uploadPhotos" component={null} />
        <Route path="/parts">
          <Redirect to="/parts/capturePhotos" />
        </Route>
      </Switch>
    </Flex>
  );
};

const Tab = (): JSX.Element => {
  const items = [
    {
      key: 'uploadPhotos',
      as: Link,
      to: '/parts/uploadPhotos',
      content: 'Upload Photos',
    },
    {
      key: 'capturePhotos',
      as: Link,
      to: '/parts/capturePhotos',
      content: 'Capture Photo',
    },
  ];

  const { pathname } = useLocation();
  const activeIndex = items.findIndex((ele) => ele.to === pathname);

  return <Menu items={items} activeIndex={activeIndex} pointing primary />;
};

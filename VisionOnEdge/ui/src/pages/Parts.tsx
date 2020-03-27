import React from 'react';
import { Flex, Input, TextArea, Button, Text, Menu, Grid } from '@fluentui/react-northstar';
import { Link, useLocation, Switch, Route, Redirect } from 'react-router-dom';
import { CapturePhotos } from '../components/CapturePhoto';

export const Parts = (): JSX.Element => {
  return (
    <Grid columns={'repeat(12, 1fr)'} styles={{ gridColumnGap: '20px', height: '100%' }}>
      <LeftPanel />
      <RightPanel />
    </Grid>
  );
};

const LeftPanel = (): JSX.Element => {
  return (
    <Flex column space="around" styles={{ gridColumn: '1 / span 4' }}>
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

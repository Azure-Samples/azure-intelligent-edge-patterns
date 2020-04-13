import React, { useState, useEffect } from 'react';
import { Flex, Input, TextArea, Button, Menu, Grid } from '@fluentui/react-northstar';
import { Link, useLocation, Switch, Route, Redirect, useParams, useHistory } from 'react-router-dom';
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
  const { partId } = useParams();
  const history = useHistory();

  useEffect(() => {
    if (partId) {
      fetch(`/api/parts/${partId}/`)
        .then((res) => res.json())
        .then((data) => {
          setName(data.name);
          setDescription(data.description);
          return void 0;
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [partId]);

  const onSave = (): void => {
    const hasPartId = partId !== 'undefined';
    const url = hasPartId ? `/api/parts/${partId}/` : `/api/parts/`;

    fetch(url, {
      body: JSON.stringify({
        name,
        description,
      }),
      method: hasPartId ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        history.push(`/parts/detail/${data.id}/capturePhotos`);
        return void 0;
      })
      .catch((err) => {
        console.error(err);
      });
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
  const { partId } = useParams();

  return (
    <Flex column gap="gap.small" styles={{ gridColumn: '5 / span 8' }}>
      <Tab partId={partId} />
      <Switch>
        <Route path="/parts/detail/:partId/capturePhotos" component={CapturePhotos} />
        <Route path="/parts/detail/:partId/uploadPhotos" component={null} />
        <Route path="/parts/detail/">
          <Redirect to={`/parts/detail/${partId}/capturePhotos`} />
        </Route>
      </Switch>
    </Flex>
  );
};

const Tab = ({ partId }): JSX.Element => {
  const items = [
    {
      key: 'uploadPhotos',
      as: Link,
      to: `/parts/detail/${partId}/uploadPhotos`,
      content: 'Upload Photos',
    },
    {
      key: 'capturePhotos',
      as: Link,
      to: `/parts/detail/${partId}/capturePhotos`,
      content: 'Capture Photo',
    },
  ];

  const { pathname } = useLocation();
  const activeIndex = items.findIndex((ele) => ele.to === pathname);

  return <Menu items={items} activeIndex={activeIndex} pointing primary />;
};

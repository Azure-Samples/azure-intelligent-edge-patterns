import React, { useState, useEffect } from 'react';
import { Flex, Input, TextArea, Button, Menu, Grid, Alert } from '@fluentui/react-northstar';
import { Link, useLocation, Switch, Route, useParams, useHistory } from 'react-router-dom';
import axios from 'axios';

import { CapturePhotos } from '../components/CapturePhoto';
import { UploadPhotos } from '../components/UploadPhotos';

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
  const [error, setError] = useState('');
  const { partId } = useParams();
  const history = useHistory();

  useEffect(() => {
    if (partId) {
      axios
        .get(`/api/parts/${partId}/`)
        .then(({ data }) => {
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
    const hasPartId = partId !== undefined;
    const url = hasPartId ? `/api/parts/${partId}/` : `/api/parts/`;

    axios({
      method: hasPartId ? 'PUT' : 'POST',
      url,
      data: {
        name,
        description,
      },
    })
      .then(({ data }) => {
        history.push(`/parts/detail/${data.id}/capturePhotos`);
        return void 0;
      })
      .catch((err) => {
        setError(JSON.stringify(err.response.data));
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
        <Button content="Save" primary onClick={onSave} disabled={!name || !description} />
        <Button content="Cancel" />
      </Flex>
      {!!error && <Alert danger content={error} dismissible />}
    </Flex>
  );
};

const RightPanel = (): JSX.Element => {
  const { partId } = useParams();

  return (
    <Flex column gap="gap.small" styles={{ gridColumn: '5 / span 8' }}>
      {partId ? <Tab partId={partId} /> : null}
      <Switch>
        <Route path="/parts/detail/:partId/capturePhotos" component={CapturePhotos} />
        <Route path="/parts/detail/:partId/uploadPhotos">
          <UploadPhotos partId={partId} />
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

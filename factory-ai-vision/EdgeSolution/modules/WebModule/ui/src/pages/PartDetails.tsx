import React, { useState, useEffect } from 'react';
import { Flex, Input, Button, Menu, Grid, Alert } from '@fluentui/react-northstar';
import { Link, useLocation, Switch, Route, useHistory } from 'react-router-dom';
import axios from 'axios';

import { CapturePhotos } from '../components/CapturePhoto';
import { UploadPhotos } from '../components/UploadPhotos';
import { useQuery } from '../hooks/useQuery';
import { CapturedImagesContainer } from '../components/CapturePhoto/CapturePhotos';

export const PartDetails = (): JSX.Element => {
  const partId = useQuery().get('partId');
  const [goLabelImageIdx, setGoLabelImageIdx] = useState<number>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const history = useHistory();

  const onSave = (): void => {
    axios({
      method: 'PUT',
      url: `/api/parts/${partId}/`,
      data: {
        name,
        description,
      },
    })
      .then(() => {
        history.push(`/parts/`);
        return void 0;
      })
      .catch((err) => {
        setError(JSON.stringify(err.response.data));
      });
  };

  return (
    <Grid columns={'1fr 1fr'} rows={'80px auto 50px'} styles={{ gridColumnGap: '20px', height: '100%' }}>
      {partId ? <Tab partId={partId} /> : null}
      <RightPanel
        partId={partId}
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
      />
      <LeftPanel partId={partId} goLabelImageIdx={goLabelImageIdx} setGoLabelImageIdx={setGoLabelImageIdx} />
      <Flex styles={{ gridColumn: '2 / span 1' }} hAlign="center" vAlign="center" column>
        <Button content="Save" primary onClick={onSave} disabled={!name} />
        {!!error && <Alert danger content={error} dismissible />}
      </Flex>
    </Grid>
  );
};

const RightPanel = ({ partId, name, setName, description, setDescription }): JSX.Element => {
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
  }, [partId, setDescription, setName]);

  return (
    <div
      style={{
        display: 'flex',
        flexFlow: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Input
        placeholder="Enter Part Name..."
        fluid
        value={name}
        onChange={(_, newProps): void => {
          setName(newProps.value);
        }}
      />
      <Input
        placeholder="Enter Description..."
        fluid
        value={description}
        onChange={(_, newProps): void => {
          setDescription(newProps.value);
        }}
      />
    </div>
  );
};

const LeftPanel = ({ partId, goLabelImageIdx, setGoLabelImageIdx }): JSX.Element => {
  return (
    <Switch>
      <Route path={`/parts/detail/capturePhotos`}>
        <Flex column gap="gap.small">
          <CapturePhotos
            partId={parseInt(partId, 10)}
            goLabelImageIdx={goLabelImageIdx}
            setGoLabelImageIdx={setGoLabelImageIdx}
          />
        </Flex>
        <Flex column gap="gap.small" styles={{ width: '800px' }}>
          <CapturedImagesContainer partId={parseInt(partId, 10)} goLabelImageIdx={goLabelImageIdx} />
        </Flex>
      </Route>
      <Route path={`/parts/detail/uploadPhotos`}>
        <Flex column gap="gap.small" styles={{ gridColumn: '1 / span 2' }}>
          <UploadPhotos partId={parseInt(partId, 10)} />
        </Flex>
      </Route>
    </Switch>
  );
};

const Tab = ({ partId }): JSX.Element => {
  const items = [
    {
      key: 'uploadPhotos',
      as: Link,
      to: `/parts/detail/uploadPhotos?partId=${partId}`,
      content: 'Upload Photos',
    },
    {
      key: 'capturePhotos',
      as: Link,
      to: `/parts/detail/capturePhotos?partId=${partId}`,
      content: 'Capture Photo',
    },
  ];

  const { pathname } = useLocation();
  const activeIndex = items.findIndex((ele) => ele.to.split('?')[0] === pathname);

  return (
    <div>
      <Menu items={items} activeIndex={activeIndex} pointing primary />
    </div>
  );
};

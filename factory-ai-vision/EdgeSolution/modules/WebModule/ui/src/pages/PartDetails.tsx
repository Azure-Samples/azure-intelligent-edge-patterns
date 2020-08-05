import React, { useState, useEffect } from 'react';
import { Flex, Input, Button, Menu, Grid, Alert, Provider } from '@fluentui/react-northstar';
import { Link, useLocation, Switch, Route, useHistory, Redirect } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { CapturePhotos } from '../components/CapturePhoto';
import { UploadPhotos } from '../components/UploadPhotos';
import { useQuery } from '../hooks/useQuery';
import { WarningDialog } from '../components/WarningDialog';
import { errorTheme } from '../themes/errorTheme';
import { LoadingDialog, Status } from '../components/LoadingDialog/LoadingDialog';
import { useProject } from '../hooks/useProject';
import { State } from '../store/State';
import { getParts, patchPart, deletePart, selectPartById, Part } from '../features/partSlice';
import { getImages } from '../features/imageSlice';

export const PartDetails = (): JSX.Element => {
  const partId = parseInt(useQuery().get('partId'), 10);

  const part = useSelector<State, Part>(
    (state) => selectPartById(state, partId) || { id: null, name: '', description: '' },
  );
  const dispatch = useDispatch();
  // Because we need project ID for delete part
  useProject(false);

  const [name, setName] = useState(part?.name);
  const [description, setDescription] = useState(part?.description);

  // Describe if parts and images is getting
  const [loading, setLoading] = useState(true);
  // Describe if parts is patching or deleting
  const [status, setStatus] = useState<Status>(Status.None);
  const [error, setError] = useState('');

  const history = useHistory();

  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        await Promise.all([dispatch(getParts(false)), dispatch(getImages())]);
      } catch (e) {
        setError(e);
      }
      setLoading(false);
    };

    loadData();
  }, [dispatch]);

  useEffect(() => {
    setName(part.name);
    setDescription(part.description);
  }, [part.name, part.description]);

  const onSave = async (): Promise<void> => {
    setStatus(Status.Loading);
    try {
      await dispatch(patchPart({ data: { name, description }, id: partId }));
      setStatus(Status.Success);
    } catch (e) {
      setError(e);
    }
  };

  const onDelete = async (): Promise<void> => {
    setStatus(Status.Loading);

    try {
      await dispatch(deletePart(partId));
    } catch (e) {
      setError(e);
    }
  };

  if (loading) return <h1>Loading...</h1>;

  if (!part.id) return <Redirect to="/parts" />;

  const saveBtnDisabled = !name || (name === part.name && description === part.description);

  return (
    <Grid columns={'68% 30%'} rows={'80px auto 30px'} styles={{ gridColumnGap: '20px', height: '100%' }}>
      {partId ? <Tab partId={partId} /> : null}
      <PartInfoForm name={name} setName={setName} description={description} setDescription={setDescription} />
      <Flex
        column
        gap="gap.small"
        styles={{ gridColumn: '1 / span 2', gridRow: '2 / span 1', height: '100%' }}
      >
        <CaptureImagePanel partId={partId} partName={name} />
      </Flex>
      <Flex styles={{ gridColumn: '2 / span 1' }} hAlign="center" vAlign="center" gap="gap.small">
        <Button content="Save" primary onClick={onSave} disabled={saveBtnDisabled} />
        <Provider theme={errorTheme}>
          <WarningDialog
            contentText={
              <p>
                Sure you want to delete the part <b>{name}</b>?
              </p>
            }
            trigger={<Button content="Delete" primary />}
            onConfirm={onDelete}
          />
        </Provider>
        <LoadingDialog
          status={status}
          onConfirm={(): void => {
            if (status === Status.Success) history.push(`/parts/`, 'AFTER_DELETE');
          }}
        />
        {!!error && <Alert danger content={error} dismissible />}
      </Flex>
    </Grid>
  );
};

const PartInfoForm = ({ name, setName, description, setDescription }): JSX.Element => {
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

const CaptureImagePanel = ({ partId, partName }): JSX.Element => {
  return (
    <Switch>
      <Route path={`/parts/detail/capturePhotos`}>
        <CapturePhotos partId={parseInt(partId, 10)} partName={partName} />
      </Route>
      <Route path={`/parts/detail/uploadPhotos`}>
        <UploadPhotos partId={parseInt(partId, 10)} />
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

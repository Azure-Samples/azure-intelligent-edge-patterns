import React, { useState, useEffect } from 'react';
import { Flex, Input, Button, Menu, Grid, Alert, Provider } from '@fluentui/react-northstar';
import { Link, useLocation, Switch, Route, useHistory } from 'react-router-dom';
import axios from 'axios';

import { CapturePhotos } from '../components/CapturePhoto';
import { UploadPhotos } from '../components/UploadPhotos';
import { useQuery } from '../hooks/useQuery';
import { WarningDialog } from '../components/WarningDialog';
import { errorTheme } from '../themes/errorTheme';
import { LoadingDialog, Status } from '../components/LoadingDialog/LoadingDialog';
import { useProject } from '../hooks/useProject';

export const PartDetails = (): JSX.Element => {
  const partId = useQuery().get('partId');
  const [goLabelImageIdx, setGoLabelImageIdx] = useState<number>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const history = useHistory();
  const [status, setStatus] = useState<Status>(Status.None);
  const project = useProject(false);

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

  const onDelete = async (): Promise<void> => {
    setStatus(Status.Loading);

    try {
      await axios.get(`/api/projects/${project.data.id}/delete_tag?part_name=${name}`);
      await axios.delete(`/api/parts/${partId}/`);
      setStatus(Status.Success);
    } catch (e) {
      setError(e);
    }
  };

  return (
    <Grid columns={'68% 30%'} rows={'80px auto 30px'} styles={{ gridColumnGap: '20px', height: '100%' }}>
      {partId ? <Tab partId={partId} /> : null}
      <PartInfoForm
        partId={partId}
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
      />
      <Flex column gap="gap.small" styles={{ gridColumn: '1 / span 2' }}>
        <CaptureImagePanel
          partId={partId}
          partName={name}
          goLabelImageIdx={goLabelImageIdx}
          setGoLabelImageIdx={setGoLabelImageIdx}
        />
      </Flex>
      <Flex styles={{ gridColumn: '2 / span 1' }} hAlign="center" vAlign="center" gap="gap.small">
        <Button content="Save" primary onClick={onSave} disabled={!name} />
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
          onConfirm={() => {
            if (status === Status.Success) history.push(`/parts/`);
          }}
        />
        {!!error && <Alert danger content={error} dismissible />}
      </Flex>
    </Grid>
  );
};

const PartInfoForm = ({ partId, name, setName, description, setDescription }): JSX.Element => {
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

const CaptureImagePanel = ({ partId, partName, goLabelImageIdx, setGoLabelImageIdx }): JSX.Element => {
  return (
    <Switch>
      <Route path={`/parts/detail/capturePhotos`}>
        <CapturePhotos
          partId={parseInt(partId, 10)}
          partName={partName}
          goLabelImageIdx={goLabelImageIdx}
          setGoLabelImageIdx={setGoLabelImageIdx}
        />
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

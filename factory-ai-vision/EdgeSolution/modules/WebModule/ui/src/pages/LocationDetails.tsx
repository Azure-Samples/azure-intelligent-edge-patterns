import React, { FC, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Text, Grid, Divider, Provider, Button } from '@fluentui/react-northstar';
import { useHistory } from 'react-router-dom';
import ImageLink from '../components/ImageLink';
import { Location } from '../reducers/type';
import { State } from '../store/State';
import { useQuery } from '../hooks/useQuery';
import { errorTheme } from '../themes/errorTheme';
import { WarningDialog } from '../components/WarningDialog';
import { Status, LoadingDialog } from '../components/LoadingDialog/LoadingDialog';
import { selectLocationById, deleteLocation } from '../features/locationSlice';

const LocationDetails: FC = () => {
  const id = useQuery().get('id');
  const location = useSelector<State, Location>((state) => selectLocationById(state, id));
  const dispatch = useDispatch();
  const history = useHistory();
  const [status, setStatus] = useState<Status>(Status.None);
  const [error, setError] = useState<Error>(null);

  if (location === undefined) {
    history.push('/locations');
    return null;
  }

  const onDelete = async (): Promise<void> => {
    setStatus(Status.Loading);
    try {
      await dispatch(deleteLocation(location.id));
      setStatus(Status.Success);
      history.push('/locations');
    } catch (e) {
      setStatus(Status.Failed);
      setError(e);
    }
  };

  return (
    <>
      <Text size="larger" weight="semibold">
        Details
      </Text>
      <Divider color="black" />
      <Grid columns="20% 3fr" rows="100px auto" styles={{ height: '40%', width: '50%' }}>
        <ImageLink defaultSrc="/icons/defaultLocation.png" width="6.25em" height="6.25em" />
        <h2>{location.name}</h2>
        <Text weight="bold">Description:</Text>
        <Text styles={{ height: '100%' }}>{location.description}</Text>
      </Grid>
      <Provider theme={errorTheme}>
        <WarningDialog
          contentText={
            <p>
              Sure you want to delete the part <b>{id}</b>?
            </p>
          }
          trigger={<Button content="Delete" primary />}
          onConfirm={onDelete}
        />
      </Provider>
      <LoadingDialog
        status={status}
        onConfirm={(): void => history.push('/locations')}
        errorMessage={error?.message}
      />
    </>
  );
};

export default LocationDetails;

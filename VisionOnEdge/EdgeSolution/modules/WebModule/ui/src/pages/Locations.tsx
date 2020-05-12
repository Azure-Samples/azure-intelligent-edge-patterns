import React, { useEffect, FC } from 'react';
import { Flex, Grid, Button, AddIcon } from '@fluentui/react-northstar';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

import { State } from '../store/State';
import { Location } from '../store/location/locationTypes';
import ImageLink from '../components/ImageLink';
import { getLocations } from '../store/location/locationActions';

const Locations: FC = () => {
  const dispatch = useDispatch();
  const locations = useSelector<State, Location[]>((state) => state.locations);

  useEffect(() => {
    dispatch(getLocations());
  }, [dispatch]);
  return (
    <Flex column gap="gap.large" padding="padding.medium" styles={{ height: '100%' }}>
      <Grid columns="8" styles={{ height: '75%' }}>
        {locations.map((location, i) => (
          <ImageLink
            key={i}
            to={`/locations/${location.name}`}
            defaultSrc="/icons/defaultLocation.png"
            width="100px"
            height="100px"
            label={location.name}
          />
        ))}
      </Grid>
      <Flex hAlign="end">
      <Link to="/locations/register">
        <Button
          primary
          fluid
          circular
          content={<AddIcon size="largest" circular />}
          style={{ width: '6em', height: '6em' }}
        />
        </Link>
      </Flex>
    </Flex>
  );
};

export default Locations;

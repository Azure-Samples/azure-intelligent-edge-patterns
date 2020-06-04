import React, { useEffect, FC } from 'react';
import { Grid } from '@fluentui/react-northstar';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

import { State } from '../store/State';
import { Location } from '../store/location/locationTypes';
import ImageLink from '../components/ImageLink';
import { getLocations } from '../store/location/locationActions';
import AddButton from '../components/AddButton';

const Locations: FC = () => {
  const dispatch = useDispatch();
  const locations = useSelector<State, Location[]>((state) => state.locations.filter((e) => !e.is_demo));

  useEffect(() => {
    dispatch(getLocations());
  }, [dispatch]);
  return (
    <div
      style={{
        display: 'flex',
        flexFlow: 'column',
        justifyContent: 'space-between',
        padding: '3em',
        height: '100%',
      }}
    >
      <Grid columns="8" styles={{ height: '75%' }}>
        {locations.map((location, i) => (
          <ImageLink
            key={i}
            to={`/locations/detail?name=${location.name}`}
            defaultSrc="/icons/defaultLocation.png"
            width="6.25em"
            height="6.25em"
            label={location.name}
          />
        ))}
      </Grid>
      <div style={{ alignSelf: 'flex-end' }}>
        <Link to="/locations/register">
          <AddButton />
        </Link>
      </div>
    </div>
  );
};

export default Locations;

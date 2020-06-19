import React, { useEffect, FC } from 'react';
import { Grid } from '@fluentui/react-northstar';
import { useSelector, useDispatch } from 'react-redux';

import { State } from '../store/State';
import { Location } from '../store/location/locationTypes';
import ImageLink from '../components/ImageLink';
import { getLocations, postLocation } from '../store/location/locationActions';
import { AddModuleDialog } from '../components/AddModuleDialog';

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
        <AddModuleDialog
          header="Add Location"
          fields={[
            {
              placeholder: 'Location Name',
              key: 'name',
              type: 'input',
              required: true,
            },
            {
              placeholder: 'Coordinates',
              key: 'coordinates',
              type: 'input',
              required: false,
            },
            {
              placeholder: 'Description',
              key: 'description',
              type: 'textArea',
              required: false,
            },
          ]}
          onConfirm={({ name, description, coordinates }): void => {
            dispatch(postLocation({ name, coordinates, description, is_demo: false }));
          }}
        />
      </div>
    </div>
  );
};

export default Locations;

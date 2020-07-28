import React, { useEffect, FC } from 'react';
import { Grid } from '@fluentui/react-northstar';
import { useSelector, useDispatch } from 'react-redux';

import { State } from '../store/State';
import { Location } from '../reducers/type';
import ImageLink from '../components/ImageLink';
import { getLocations, postLocation } from '../action/creators/locationActionCreators';
import { AddModuleDialog } from '../components/AddModuleDialog';

const Locations: FC = () => {
  const dispatch = useDispatch();
  const locations = useSelector<State, Location[]>((state) => Object.values(state.locations.entities));

  useEffect(() => {
    dispatch(getLocations(false));
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
            to={`/locations/detail?id=${location.id}`}
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
              placeholder: 'Description',
              key: 'description',
              type: 'textArea',
              required: false,
            },
          ]}
          onConfirm={({ name, description }): void => {
            dispatch(postLocation({ name, description, is_demo: false }));
          }}
        />
      </div>
    </div>
  );
};

export default Locations;

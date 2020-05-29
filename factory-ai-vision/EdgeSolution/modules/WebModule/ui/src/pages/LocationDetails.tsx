import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { Flex, Text, Grid, Divider } from '@fluentui/react-northstar';
import ImageLink from '../components/ImageLink';
import { Location } from '../store/location/locationTypes';
import { State } from '../store/State';
import { useQuery } from '../hooks/useQuery';

const LocationDetails: FC = () => {
  const name = useQuery().get('name');
  const location = useSelector<State, Location>((state) => state.locations.find((e) => e.name === name));

  return (
    <>
      <Text size="larger" weight="semibold">
        Details
      </Text>
      <Divider color="black" />
      <Grid columns="15% 3fr 2fr" styles={{ height: '60%' }}>
        <Flex column gap="gap.large">
          <ImageLink defaultSrc="/icons/defaultLocation.png" width="6.25em" height="6.25em" />
          <Text>Coordinates:</Text>
          <Text>Description:</Text>
        </Flex>
        <Flex column gap="gap.large">
          <Text styles={{ paddingTop: '0.625em', minHeight: '6.25em' }}>{location.name}</Text>
          <Text>{location.coordinates}</Text>
          <Text styles={{ height: '60%' }}>{location.description}</Text>
        </Flex>
      </Grid>
    </>
  );
};

export default LocationDetails;

import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Flex, Text, Grid, Divider } from '@fluentui/react-northstar';
import ImageLink from '../components/ImageLink';
import { Location } from '../store/location/locationTypes';
import { State } from '../store/State';

const LocationDetails: FC = () => {
  const { name } = useParams();
  const location = useSelector<State, Location>((state) => state.locations.find((e) => e.name === name));

  return (
    <>
      <Text size="larger" weight="semibold">
        Details
      </Text>
      <Divider color="black" />
      <Grid columns="15% 3fr 2fr" styles={{ height: '60%' }}>
        <Flex column gap="gap.large">
          <ImageLink defaultSrc="/icons/defaultLocation.png" width="100px" height="100px" />
          <Text>Coordinates:</Text>
          <Text>Description:</Text>
        </Flex>
        <Flex column gap="gap.large">
          <Text styles={{ paddingTop: '10px', minHeight: '100px' }}>{location.name}</Text>
          <Text>{location.coordinates}</Text>
          <Text styles={{ height: '60%' }}>{location.description}</Text>
        </Flex>
      </Grid>
    </>
  );
};

export default LocationDetails;

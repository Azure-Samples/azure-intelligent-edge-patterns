import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { Text, Flex, FlexItem, Grid, Image } from '@fluentui/react-northstar';
import { useSelector } from 'react-redux';
import { State } from '../store/State';
import { Location } from '../store/location/locationTypes';

const Locations: FC = () => {
  const locations = useSelector<State, Location[]>((state) => state.locations);
  return (
    <Flex column gap="gap.large" padding="padding.medium">
      <FlexItem align="center">
        <Text size="larger" weight="semibold">
          Location
        </Text>
      </FlexItem>
      <Grid columns="8">
        {locations.map((location, i) => (
          <Flex key={i} column styles={{ maxWidth: '300px', padding: '20px' }}>
            <Link to={`/cameras/${location.name}`}>
              <Image src="/defaultCamera.png" fluid />
            </Link>
            <Text size="larger" align="center">
              {location.name}
            </Text>
          </Flex>
        ))}
      </Grid>
    </Flex>
  );
};

export default Locations;

import React, { FC } from 'react';
import { Text, Flex, FlexItem, Grid } from '@fluentui/react-northstar';
import { useSelector } from 'react-redux';
import { State } from '../store/State';
import { Location } from '../store/location/locationTypes';
import ImageLink from '../components/ImageLink';

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
          <ImageLink
            key={i}
            to={`/locations/${location.name}`}
            defaultSrc="/defaultCamera.png"
            width="100px"
            height="100px"
            label={location.name}
          />
        ))}
      </Grid>
    </Flex>
  );
};

export default Locations;

import React, { FC, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Flex, Text, Image, FlexItem, Input, TextArea, Button } from '@fluentui/react-northstar';
import { Location } from '../store/location/locationTypes';
import { postLocation } from '../store/location/locationActions';

const LocationRegister: FC = () => {
  const dispatch = useDispatch();
  const [locationRegisterInput, setLocationRegisterInput] = useState<Location>({
    locationName: '',
    coordinates: '',
    description: '',
  });

  return (
    <Flex column gap="gap.large">
      <Text size="larger" weight="semibold">
        Register Location
      </Text>
      <Flex gap="gap.large">
        <FlexItem styles={{ width: '100px', height: '100px', padding: '10px' }}>
          <Image src="/defaultCamera.png" fluid />
        </FlexItem>
        <Input
          placeholder="Location Name"
          value={locationRegisterInput.locationName}
          onChange={(_, newProps): void =>
            setLocationRegisterInput((prev) => ({ ...prev, locationName: newProps.value }))
          }
        />
      </Flex>
      <Flex gap="gap.large">
        <Text>Coordinates:</Text>
        <Input
          value={locationRegisterInput.coordinates}
          onChange={(_, newProps): void =>
            setLocationRegisterInput((prev) => ({ ...prev, coordinates: newProps.value }))
          }
        />
      </Flex>
      <Flex gap="gap.large">
        <Text>Description:</Text>
        <TextArea
          value={locationRegisterInput.description}
          onChange={(_, newProps): void =>
            setLocationRegisterInput((prev) => ({ ...prev, description: newProps.value }))
          }
        />
      </Flex>
      <Flex gap="gap.medium">
        <Button
          primary
          disabled={Object.values(locationRegisterInput).some((value) => value.length === 0)}
          onClick={(): void => {
            dispatch(postLocation(locationRegisterInput));
          }}
          content="Save"
        />
        <Button content="Cancel" />
      </Flex>
    </Flex>
  );
};

export default LocationRegister;

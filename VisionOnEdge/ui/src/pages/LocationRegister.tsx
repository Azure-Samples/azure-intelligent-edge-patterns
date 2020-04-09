import React, { FC, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Flex,
  Text,
  Image,
  FlexItem,
  Input,
  TextArea,
  Button,
  Grid,
  Divider,
} from '@fluentui/react-northstar';
import { Location } from '../store/location/locationTypes';
import { postLocation } from '../store/location/locationActions';

const LocationRegister: FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [locationRegisterInput, setLocationRegisterInput] = useState<Location>({
    name: '',
    coordinates: '',
    description: '',
  });

  return (
    <>
      <Text size="larger" weight="semibold">
        Register Location
      </Text>
      <Divider color="black" />
      <Flex styles={{ width: '30%' }} space="between">
        <FlexItem styles={{ width: '100px', height: '100px', padding: '10px' }}>
          <Image src="/defaultCamera.png" fluid />
        </FlexItem>
        <Input
          styles={{ paddingTop: '10px', height: '100px' }}
          placeholder="Location Name"
          value={locationRegisterInput.name}
          onChange={(_, newProps): void =>
            setLocationRegisterInput((prev) => ({ ...prev, name: newProps.value }))
          }
        />
      </Flex>
      <Grid columns="15% 3fr 2fr" styles={{ height: '60%' }}>
        <Flex column gap="gap.large">
          <Text>Coordinates:</Text>
          <Text>Description:</Text>
        </Flex>
        <Flex column gap="gap.large">
          <Input
            value={locationRegisterInput.coordinates}
            onChange={(_, newProps): void =>
              setLocationRegisterInput((prev) => ({ ...prev, coordinates: newProps.value }))
            }
          />
          <TextArea
            styles={{ height: '60%' }}
            value={locationRegisterInput.description}
            onChange={(_, newProps): void =>
              setLocationRegisterInput((prev) => ({ ...prev, description: newProps.value }))
            }
          />
        </Flex>
      </Grid>
      <Flex gap="gap.medium" padding="padding.medium">
        <Button
          primary
          disabled={Object.values(locationRegisterInput).includes('')}
          onClick={(): void => {
            dispatch(postLocation(locationRegisterInput));
          }}
          content="Save"
        />
        <Button
          content="Cancel"
          onClick={(): void => {
            history.push('/location');
          }}
        />
      </Flex>
    </>
  );
};

export default LocationRegister;

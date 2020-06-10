import React, { FC, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Flex, Text, Input, TextArea, Button, Grid, Divider } from '@fluentui/react-northstar';
import ImageLink from '../components/ImageLink';
import { postLocation } from '../store/location/locationActions';

const LocationRegister: FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [name, setName] = useState<string>('');
  const [coordinates, setCoordinates] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  return (
    <>
      <Text size="larger" weight="semibold">
        Register Location
      </Text>
      <Divider color="black" />
      <Grid columns="15% 3fr 2fr" styles={{ height: '60%' }}>
        <Flex column gap="gap.large">
          <ImageLink defaultSrc="/icons/defaultLocation.png" width="100px" height="100px" />
          <Text>Coordinates:</Text>
          <Text>Description:</Text>
        </Flex>
        <Flex column gap="gap.large">
          <Input
            styles={{ paddingTop: '10px', minHeight: '100px' }}
            placeholder="Location Name"
            value={name}
            onChange={(_, newProps): void => setName(newProps.value)}
          />
          <Input value={coordinates} onChange={(_, newProps): void => setCoordinates(newProps.value)} />
          <TextArea
            styles={{ height: '60%' }}
            value={description}
            onChange={(_, newProps): void => setDescription(newProps.value)}
          />
        </Flex>
      </Grid>
      <Flex gap="gap.medium" padding="padding.medium">
        <Button
          primary
          disabled={[name, coordinates, description].includes('')}
          onClick={(): void => {
            dispatch(postLocation({ name, coordinates, description, is_demo: false }));
            history.push('/locations');
          }}
          content="Save"
        />
        <Button
          content="Cancel"
          onClick={(): void => {
            history.push('/locations');
          }}
        />
      </Flex>
    </>
  );
};

export default LocationRegister;

import React, { FC } from 'react';
import { Text, Flex } from '@fluentui/react-northstar';
import { useDispatch } from 'react-redux';

import ImageLink from '../components/ImageLink';
import { openDialog } from '../store/dialog/dialogIsOpenActions';

const Home: FC = () => {
  const dispatch = useDispatch();
  return (
    <Flex column gap="gap.medium">
      <Text size="larger" weight="semibold">
        Hello User!
      </Text>
      <Text>
      </Text>
      <Text color="white" styles={{ backgroundColor: '#373644', padding: '0.125em 0.125em 0.125em 0.625em' }}>
        GET STARTED:
      </Text>
      <Flex gap="gap.large">
        <ImageLink
          imgSrc="/icons/location-filled.png"
          to="/locations/register"
          label="Register a new Location"
          width="6.25em"
        />
        <ImageLink
          imgSrc="/icons/camera-filled.png"
          to="/cameras"
          label="Register a new Camera"
          width="6.25em"
          imgPadding="0.625em 0.1875em 0.625em 0.1875em"
          onClick={(): void => {
            dispatch(openDialog());
          }}
        />
        <ImageLink
          imgSrc="/icons/part-filled.png"
          to="/parts/detail"
          label="Register a new Part"
          width="6.25em"
        />
      </Flex>
      <Text color="white" styles={{ backgroundColor: '#373644', padding: '0.125em 0.125em 0.125em 0.625em' }}>
        SELECT FROM THE FOLLOWING TASKS:
      </Text>
      <Flex gap="gap.large">
        <ImageLink
          imgSrc="/icons/doubleCube.png"
          to="/partIdentification"
          label="Identify Parts"
          width="6.25em"
        />
        <ImageLink imgSrc="/icons/defects.png" to="/" label="Identify Defects" width="6.25em" />
        <ImageLink
          imgSrc="/icons/manual-filled.png"
          to="/manual"
          label="Identify items manually"
          width="6.25em"
        />
      </Flex>
    </Flex>
  );
};

export default Home;

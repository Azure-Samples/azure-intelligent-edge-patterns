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
      <Text color="white" styles={{ backgroundColor: '#373644', padding: '2px 2px 2px 10px' }}>
        GET STARTED:
      </Text>
      <Flex gap="gap.large">
        <ImageLink
          imgSrc="/icons/location-filled.png"
          to="/locations/register"
          label="Register a new Location"
          width="100px"
        />
        <ImageLink
          imgSrc="/icons/camera-filled.png"
          to="/cameras"
          label="Register a new Camera"
          width="100px"
          imgPadding="10px 3px 10px 3px"
          onClick={(): void => {
            dispatch(openDialog());
          }}
        />
        <ImageLink
          imgSrc="/icons/part-filled.png"
          to="/parts/detail"
          label="Register a new Part"
          width="100px"
        />
      </Flex>
      <Text color="white" styles={{ backgroundColor: '#373644', padding: '2px 2px 2px 10px' }}>
        SELECT FROM THE FOLLOWING TASKS:
      </Text>
      <Flex gap="gap.large">
        <ImageLink
          imgSrc="/icons/doubleCube.png"
          to="/partIdentification"
          label="Identify Parts"
          width="100px"
        />
        <ImageLink imgSrc="/icons/defects.png" to="/" label="Identify Defects" width="100px" />
        <ImageLink
          imgSrc="/icons/manual-filled.png"
          to="/manual"
          label="Identify items manually"
          width="100px"
        />
      </Flex>
    </Flex>
  );
};

export default Home;

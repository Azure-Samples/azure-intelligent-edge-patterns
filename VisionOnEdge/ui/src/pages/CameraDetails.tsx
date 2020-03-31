import React, { FC } from 'react';
import { useParams } from 'react-router-dom';
import { Text, Flex, Image, FlexItem } from '@fluentui/react-northstar';
import { useSelector } from 'react-redux';
import { State, Camera } from '../State';

const CameraDetails: FC = (): JSX.Element => {
  const { name } = useParams();
  const camera = useSelector<State, Camera>((state) => state.cameras.find((e) => e.name === name));

  return (
    <Flex style={{ margin: 30 }} column gap="gap.medium">
      <FlexItem align="center">
        <Text size="larger" weight="semibold">
          Details
        </Text>
      </FlexItem>
      <Flex space="between">
        <Text size="large" content={`Name: ${name}`} />
        <Image fluid src="/defalutCamera.png" circular styles={{ maxWidth: '300px' }} />
      </Flex>
      <Text size="large" content={`RTSP Url: ${camera.rtsp}`} />
      <Text size="large" content={`Model: ${camera.model_name}`} />
    </Flex>
  );
};

export default CameraDetails;

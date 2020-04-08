import React, { FC } from 'react';
import { Flex, FlexItem, Text, Image } from '@fluentui/react-northstar';

interface CameraDetailInfoProps {
  name: string;
  rtsp: string;
  modelName: string;
}
const CameraDetailInfo: FC<CameraDetailInfoProps> = ({ name, rtsp, modelName }) => {
  return (
    <Flex style={{ margin: 30 }} column gap="gap.medium">
      <Flex space="between">
        <Text size="larger" weight="semibold">
          Details
        </Text>
        <FlexItem styles={{ width: '100px', height: '100px', padding: '10px' }}>
          <Image src="/defaultCamera.png" fluid />
        </FlexItem>
      </Flex>
      <Flex padding="padding.medium" gap="gap.large">
        <Flex column>
          <Text size="large" content={'Name:'} />
          <Text size="large" content={'RTSP Url:'} />
          <Text size="large" content={'Model:'} />
        </Flex>
        <Flex column>
          <Text size="large" content={name} />
          <Text size="large" content={rtsp} />
          <Text size="large" content={modelName} />
        </Flex>
      </Flex>
    </Flex>
  );
};

export default CameraDetailInfo;

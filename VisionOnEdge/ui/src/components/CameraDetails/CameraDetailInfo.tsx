import React, { FC } from 'react';
import { Flex, Text, Grid } from '@fluentui/react-northstar';

import ImageLink from '../ImageLink';

interface CameraDetailInfoProps {
  name: string;
  rtsp: string;
  modelName: string;
}
const CameraDetailInfo: FC<CameraDetailInfoProps> = ({ name, rtsp, modelName }) => {
  return (
    <Flex styles={{ padding: "1rem 2rem" }} column gap="gap.large">
      <Grid columns="2">
        <Text size="larger" weight="semibold">
          Details
        </Text>
        <ImageLink defaultSrc="/defaultCamera.png" width="100px" height="100px" />
      </Grid>
      <Grid columns="2">
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
      </Grid>
    </Flex>
  );
};

export default CameraDetailInfo;

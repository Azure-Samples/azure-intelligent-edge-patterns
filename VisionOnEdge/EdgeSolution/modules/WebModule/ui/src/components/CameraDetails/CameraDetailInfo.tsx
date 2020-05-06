import React, { FC, memo } from 'react';
import { Flex, Text, Grid, Button } from '@fluentui/react-northstar';
import { useDispatch } from 'react-redux';

import ConfirmDialog from '../ConfirmDialog';
import ImageLink from '../ImageLink';
import { deleteCamera } from '../../store/camera/cameraActions';

interface CameraDetailInfoProps {
  name: string;
  rtsp: string;
  modelName: string;
  id: number;
}
const CameraDetailInfo: FC<CameraDetailInfoProps> = ({ id, name, rtsp, modelName }) => {
  const dispatch = useDispatch();

  return (
    <Flex styles={{ padding: '1em 2em' }} column space="between">
      <Grid columns="2" styles={{ gap: '3em' }}>
        <Text size="larger" weight="semibold">
          Details
        </Text>
        <ImageLink defaultSrc="/icons/defaultCamera.png" width="100px" height="100px" />
        <Flex column gap="gap.small">
          <Text size="large" content={'Name:'} />
          <Text size="large" content={'RTSP Url:'} />
          <Text size="large" content={'Model:'} />
        </Flex>
        <Flex column gap="gap.medium">
          <Text size="large" content={name} />
          <Text size="large" content={rtsp} />
          <Text size="large" content={modelName} />
        </Flex>
      </Grid>
      <ConfirmDialog
        trigger={
          <Button
            primary
            content="Delete Camera"
            styles={{
              backgroundColor: '#C4314B',
              ':hover': { backgroundColor: '#A72037' },
              ':active': { backgroundColor: '#8E192E' },
            }}
          />
        }
        content="Delete Camera"
        primaryStyles={{
          backgroundColor: '#C4314B',
          ':hover': { backgroundColor: '#A72037' },
          ':active': { backgroundColor: '#8E192E' },
        }}
        onConfirm={(): void => {
          dispatch(deleteCamera(id));
        }}
      />
    </Flex>
  );
};

export default memo(CameraDetailInfo);

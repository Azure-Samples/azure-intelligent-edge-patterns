import React, { useRef } from 'react';
import { Stack, Text, ActionButton } from '@fluentui/react';
import { useHistory } from 'react-router-dom';

import { Url } from '../../constant';

import { RTSPVideo } from '../../components/RTSPVideo';

interface Props {
  cameraId: number;
}

const CameraLiveFeed = (props: Props) => {
  const { cameraId } = props;

  const streamIdRef = useRef('');
  const history = useHistory();

  return (
    <Stack style={{ width: '80%' }}>
      <Text styles={{ root: { fontWeight: 600, fontSize: '16px' } }}>Live feed</Text>
      <ActionButton iconProps={{ iconName: 'Camera' }} onClick={() => history.push(Url.IMAGES)}>
        Capture image
      </ActionButton>
      <Stack.Item grow>
        <div style={{ height: '90%' }}>
          <RTSPVideo
            cameraId={cameraId}
            onStreamCreated={(streamId) => {
              streamIdRef.current = streamId;
            }}
          />
        </div>
      </Stack.Item>
    </Stack>
  );
};

export default CameraLiveFeed;

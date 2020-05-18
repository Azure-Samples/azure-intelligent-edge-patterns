import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  Button,
  PlayIcon,
  CallControlPresentNewIcon,
  PauseThickIcon,
  Image,
} from '@fluentui/react-northstar';

import { thunkAddCapturedImages } from '../../store/part/partActions';
import { RTSPVideoProps } from './RTSPVideo.type';

export const RTSPVideoComponent: React.FC<RTSPVideoProps> = ({
  rtsp = null,
  partId,
  canCapture,
  onVideoStart,
  onVideoPause,
}) => {
  const [streamId, setStreamId] = useState<string>('');
  const dispatch = useDispatch();

  const onCreateStream = (): void => {
    let url = `/api/streams/connect/?part_id=${partId}&rtsp=${rtsp}`;
    if (!canCapture) url += '&inference=1';
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data?.status === 'ok') {
          setStreamId(data.stream_id);
        }
        return null;
      })
      .catch((err) => {
        console.error(err);
      });
    if (onVideoStart) onVideoStart();
  };

  const onCapturePhoto = (): void => {
    dispatch(thunkAddCapturedImages(streamId));
  };

  const onDisconnect = (): void => {
    setStreamId('');
    fetch(`/api/streams/${streamId}/disconnect`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        return null;
      })
      .catch((err) => {
        console.error(err);
      });
    if (onVideoPause) onVideoPause();
  };

  useEffect(() => {
    window.addEventListener('beforeunload', onDisconnect);
    return (): void => {
      window.removeEventListener('beforeunload', onDisconnect);
    };
  });

  const src = streamId ? `/api/streams/${streamId}/video_feed` : '';

  return (
    <>
      <div style={{ width: '100%', height: '600px', backgroundColor: 'black' }}>
        {src ? <Image src={src} styles={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : null}
      </div>
      <Button.Group
        styles={{ alignSelf: 'center' }}
        buttons={[
          {
            key: 'start',
            icon: <PlayIcon />,
            iconOnly: true,
            onClick: onCreateStream,
            disabled: rtsp === null,
          },
          canCapture && {
            key: 'capture',
            icon: <CallControlPresentNewIcon />,
            iconOnly: true,
            onClick: onCapturePhoto,
            disabled: !streamId,
          },
          {
            key: 'stop',
            icon: <PauseThickIcon />,
            iconOnly: true,
            onClick: onDisconnect,
            disabled: !streamId,
          },
        ]}
      />
    </>
  );
};

export const RTSPVideo = React.memo(RTSPVideoComponent);

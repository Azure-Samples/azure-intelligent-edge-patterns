import React, { useState, useEffect, useCallback } from 'react';
import Axios from 'axios';

import { RTSPVideoProps, CaptureLabelMode } from './RTSPVideo.type';
import { useInterval } from '../../hooks/useInterval';
import { Stack } from '@fluentui/react';

// TODO Check if we need two mode for capturing & the capturing UX
export const RTSPVideoComponent: React.FC<RTSPVideoProps> = ({
  rtsp = null,
  partId = null,
  canCapture,
  onCapturePhoto,
  autoPlay,
}) => {
  const [streamId, setStreamId] = useState<string>('');
  const [captureLabelMode, setCaptureLabelMode] = useState<CaptureLabelMode>(CaptureLabelMode.PerImage);

  const onCreateStream = useCallback((): void => {
    const url =
      partId === null
        ? `/api/streams/connect/?rtsp=${rtsp}`
        : `/api/streams/connect/?part_id=${partId}&rtsp=${rtsp}`;
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
  }, [partId, rtsp]);

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
  };

  useInterval(
    () => {
      Axios.get(`/api/streams/${streamId}/keep_alive`).catch(console.error);
    },
    streamId ? 3000 : null,
  );

  useEffect(() => {
    window.addEventListener('beforeunload', onDisconnect);
    return (): void => {
      window.removeEventListener('beforeunload', onDisconnect);
    };
  });

  useEffect(() => {
    if (autoPlay) onCreateStream();
  }, [autoPlay, onCreateStream]);

  const src = streamId ? `/api/streams/${streamId}/video_feed` : '';

  return (
    <Stack>
      <div style={{ width: '100%', height: '100%', backgroundColor: 'black' }}>
        {src ? <img src={src} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : null}
      </div>
    </Stack>
  );
};

export const RTSPVideo = React.memo(RTSPVideoComponent);

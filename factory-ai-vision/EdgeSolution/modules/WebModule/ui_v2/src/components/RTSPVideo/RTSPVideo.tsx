import React, { useState, useEffect, useCallback } from 'react';
import Axios from 'axios';

import { useInterval } from '../../hooks/useInterval';

type RTSPVideoProps = {
  rtsp: string;
  onStreamCreated?: (streamId: string) => void;
  partId?: number;
};

export const RTSPVideoComponent: React.FC<RTSPVideoProps> = ({ rtsp, onStreamCreated, partId = null }) => {
  const [streamId, setStreamId] = useState<string>('');

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
          onStreamCreated(data.stream_id);
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
    onCreateStream();
  }, [onCreateStream]);

  const src = streamId ? `/api/streams/${streamId}/video_feed` : '';

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: 'black' }}>
      {src ? <img src={src} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : null}
    </div>
  );
};

export const RTSPVideo = React.memo(RTSPVideoComponent);

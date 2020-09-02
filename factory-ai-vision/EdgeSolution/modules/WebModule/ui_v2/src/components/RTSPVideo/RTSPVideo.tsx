import React, { useState, useEffect, useCallback } from 'react';
import Axios from 'axios';

import { useInterval } from '../../hooks/useInterval';
import { handleAxiosError } from '../../utils/handleAxiosError';

type RTSPVideoProps = {
  rtsp: string;
  onStreamCreated?: (streamId: string) => void;
  partId?: number;
};

export const RTSPVideoComponent: React.FC<RTSPVideoProps> = ({ rtsp, onStreamCreated, partId = null }) => {
  const [streamId, setStreamId] = useState<string>('');

  const onCreateStream = useCallback((): void => {
    if (!rtsp) return;
    const url =
      partId === null
        ? `/api/streams/connect/?rtsp=${rtsp}`
        : `/api/streams/connect/?part_id=${partId}&rtsp=${rtsp}`;
    Axios.get(url)
      .then(({ data }) => {
        setStreamId(data.stream_id);
        onStreamCreated(data.stream_id);
        return void 0;
      })
      .catch(handleAxiosError)
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
    <div style={{ width: '100%', height: '100%', backgroundColor: '#F3F2F1', position: 'relative' }}>
      {src ? (
        <>
          <div
            style={{
              position: 'absolute',
              left: 20,
              top: 20,
              background: '#E00B1C',
              borderRadius: '4px',
              color: 'white',
              padding: '5px 8px',
              fontWeight: 'bold',
            }}
          >
            • LIVE
          </div>
          <img src={src} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </>
      ) : null}
    </div>
  );
};

export const RTSPVideo = React.memo(RTSPVideoComponent);

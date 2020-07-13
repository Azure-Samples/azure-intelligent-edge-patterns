import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Image, Tooltip, Flex, RadioGroup } from '@fluentui/react-northstar';

import { thunkAddCapturedImages } from '../../store/part/partActions';
import { RTSPVideoProps } from './RTSPVideo.type';

export const RTSPVideoComponent: React.FC<RTSPVideoProps> = ({
  rtsp = null,
  partId = null,
  partName = '',
  canCapture,
  setOpenLabelingPage,
  autoPlay,
}) => {
  const dispatch = useDispatch();
  const [streamId, setStreamId] = useState<string>('');
  const [captureLabelMode, setCaptureLabelMode] = useState<number>(0);

  const onCreateStream = useCallback((): void => {
    fetch(`/api/streams/connect/?part_id=${partId}&rtsp=${rtsp}`)
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

  const onCapturePhoto = (): void => {
    dispatch(thunkAddCapturedImages(streamId, partName));
    if (captureLabelMode === 0) {
      setOpenLabelingPage(true);
    }
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
  };

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
    <Flex gap="gap.small" styles={{ width: '100%', height: '100%' }} column>
      <div style={{ width: '100%', height: '100%', backgroundColor: 'black' }}>
        {src ? <Image src={src} styles={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : null}
      </div>
      <Flex column hAlign="center" gap="gap.small">
        <Flex styles={{ height: '50px' }} hAlign="center" gap="gap.large">
          <ImageBtn
            name="Play"
            src="/icons/play-button.png"
            disabled={rtsp === null}
            onClick={onCreateStream}
          />
          {canCapture && (
            <ImageBtn
              name="Capture"
              src="/icons/screenshot.png"
              disabled={!streamId}
              onClick={onCapturePhoto}
            />
          )}
          <ImageBtn name="Stop" src="/icons/stop.png" disabled={!streamId} onClick={onDisconnect} />
        </Flex>
        {canCapture && (
          <RadioGroup
            checkedValue={captureLabelMode}
            onCheckedValueChange={(_, newProps): void => {
              setCaptureLabelMode(newProps.value as number);
            }}
            items={[
              {
                key: '0',
                label: 'Capture image and label per image',
                value: 0,
              },
              {
                key: '1',
                label: 'Capture image and label all later',
                value: 1,
              },
            ]}
          />
        )}
      </Flex>
    </Flex>
  );
};

export const RTSPVideo = React.memo(RTSPVideoComponent);

const ImageBtn = ({ src, name, disabled = false, onClick = () => {} }): JSX.Element => {
  if (disabled) return <Image src={src} styles={{ height: '100%', filter: 'opacity(50%)' }} />;

  return (
    <Tooltip content={name}>
      <Image src={src} styles={{ height: '100%', cursor: 'pointer' }} onClick={onClick} />
    </Tooltip>
  );
};

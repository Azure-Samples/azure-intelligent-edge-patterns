import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Image, Tooltip, Flex, RadioGroup } from '@fluentui/react-northstar';

import { thunkAddCapturedImages } from '../../store/part/partActions';
import { RTSPVideoProps } from './RTSPVideo.type';

export const RTSPVideoComponent: React.FC<RTSPVideoProps> = ({
  rtsp = null,
  partId,
  partName,
  canCapture,
  onVideoStart,
  onVideoPause,
  setOpenLabelingPage,
}) => {
  const dispatch = useDispatch();
  const [streamId, setStreamId] = useState<string>('');
  const [captureLabelMode, setCaptureLabelMode] = useState<number>(0);

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
      <div style={{ width: '100%', height: '30rem', backgroundColor: 'black' }}>
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
      </Flex>
    </>
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

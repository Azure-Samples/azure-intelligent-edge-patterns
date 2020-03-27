import React, { useState } from 'react';
import { Flex, Dropdown, Button, Image, Text } from '@fluentui/react-northstar';
import { Link } from 'react-router-dom';

import { useCameras } from '../../hooks/useCameras';

export const CapturePhotos: React.FC = () => {
  const [capturedPhotos, setCapturePhotos] = useState<string[]>([]);

  return (
    <>
      <CameraSelector />
      <RTSPVideo setCapturePhotos={setCapturePhotos} />
      <CapturedImagesContainer captruedPhotos={capturedPhotos} />
    </>
  );
};

const CameraSelector = (): JSX.Element => {
  const availableCameraNames = useCameras().map((ele) => ele.name);

  return (
    <Flex gap="gap.small" vAlign="center">
      <Text>Select Camera</Text>
      <Dropdown items={availableCameraNames} />
      <Link to="/addCamera">Add Camera</Link>
    </Flex>
  );
};

const RTSPVideo = ({ setCapturePhotos }): JSX.Element => {
  const [streamId, setStreamId] = useState<string>('');

  const onCreateStream = (): void => {
    fetch(`/streams/connect?camera_id=0`)
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
  };

  const onCapturePhoto = (): void => {
    fetch(`/streams/${streamId}/capture`)
      .then((response) => response.json())
      .then(() => {
        // TODO Append image url from server
        setCapturePhotos((prev) => [...prev, 'https://via.placeholder.com/150']);
        return null;
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const onDisconnect = (): void => {
    fetch(`/streams/${streamId}/disconnect`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        return null;
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const src = streamId
    ? `http://localhost:8000/streams/${streamId}/video_feed`
    : 'https://via.placeholder.com/1600x900';

  return (
    <>
      <Image src={src} design={{ width: '100%' }} />
      <Button.Group
        styles={{ alignSelf: 'center' }}
        buttons={[
          { key: 'start', icon: 'play', iconOnly: true, onClick: onCreateStream },
          {
            key: 'capture',
            icon: 'call-control-present-new',
            iconOnly: true,
            onClick: onCapturePhoto,
            disabled: !streamId,
          },
          { key: 'stop', icon: 'pause-thick', iconOnly: true, onClick: onDisconnect, disabled: !streamId },
        ]}
      />
    </>
  );
};

const CapturedImagesContainer = ({ captruedPhotos }): JSX.Element => {
  return (
    <Flex styles={{ overflow: 'scroll' }}>
      {captruedPhotos.map((src, i) => (
        <Image key={i} src={src} />
      ))}
    </Flex>
  );
};

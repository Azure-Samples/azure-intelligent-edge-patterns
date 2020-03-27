import React, { useState, useEffect, useCallback } from 'react';
import { Flex, Dropdown, Button, Image, Text, DropdownItemProps } from '@fluentui/react-northstar';
import { Link } from 'react-router-dom';

import { useCameras } from '../../hooks/useCameras';
import { Camera } from '../../State';

export const CapturePhotos: React.FC = () => {
  const [capturedPhotos, setCapturePhotos] = useState<string[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<Camera>(null);

  return (
    <>
      <CameraSelector setSelectedCamera={setSelectedCamera} />
      <RTSPVideo setCapturePhotos={setCapturePhotos} selectedCameraId={selectedCamera?.id} />
      <CapturedImagesContainer captruedPhotos={capturedPhotos} />
    </>
  );
};

const CameraSelector = ({ setSelectedCamera }): JSX.Element => {
  const availableCameras = useCameras();

  const items: DropdownItemProps[] = availableCameras.map((ele) => ({
    header: ele.name,
    content: {
      key: ele.id,
    },
  }));

  const onDropdownChange = (_, data): void => {
    const { key } = data.value.content;
    const selectedCamera = availableCameras.find((ele) => ele.id === key);
    if (selectedCamera) setSelectedCamera(selectedCamera);
  };

  return (
    <Flex gap="gap.small" vAlign="center">
      <Text>Select Camera</Text>
      <Dropdown items={items} onChange={onDropdownChange} />
      <Link to="/addCamera">Add Camera</Link>
    </Flex>
  );
};

const RTSPVideo = ({ setCapturePhotos, selectedCameraId }): JSX.Element => {
  const [streamId, setStreamId] = useState<string>('');

  const onCreateStream = (): void => {
    // TODO: Use `selectedCameraId` when BE is ready
    fetch(`/streams/connect?camera_id=${0}`)
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

  const onDisconnect = useCallback((): void => {
    setStreamId('');
    fetch(`/streams/${streamId}/disconnect`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        return null;
      })
      .catch((err) => {
        console.error(err);
      });
  }, [streamId]);

  useEffect(() => {
    window.addEventListener('beforeunload', onDisconnect);
    return (): void => {
      window.removeEventListener('beforeunload', onDisconnect);
    };
  }, [onDisconnect]);

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
    <Flex styles={{ overflow: 'scroll' }} gap="gap.small">
      {captruedPhotos.map((src, i) => (
        <Image key={i} src={src} />
      ))}
    </Flex>
  );
};

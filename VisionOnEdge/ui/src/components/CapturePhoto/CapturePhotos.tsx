import React, { useState, useEffect, useCallback } from 'react';
import { Flex, Dropdown, Button, Image, Text, DropdownItemProps } from '@fluentui/react-northstar';
import { Link, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { useCameras } from '../../hooks/useCameras';
import { Camera, Part, State } from '../../State';
import { thunkAddCapturedImages, thunkGetCapturedImages } from '../../actions/part';

export const CapturePhotos: React.FC = () => {
  const [selectedCamera, setSelectedCamera] = useState<Camera>(null);

  return (
    <>
      <CameraSelector setSelectedCamera={setSelectedCamera} />
      <RTSPVideo selectedCameraId={selectedCamera?.id} />
      <CapturedImagesContainer />
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

const RTSPVideo = ({ selectedCameraId }): JSX.Element => {
  const [streamId, setStreamId] = useState<string>('');
  const dispatch = useDispatch();

  const onCreateStream = (): void => {
    // TODO: Use `selectedCameraId` when BE is ready
    fetch(`/api/streams/connect`)
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
    dispatch(thunkAddCapturedImages(streamId));
  };

  const onDisconnect = useCallback((): void => {
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
  }, [streamId]);

  useEffect(() => {
    window.addEventListener('beforeunload', onDisconnect);
    return (): void => {
      window.removeEventListener('beforeunload', onDisconnect);
    };
  }, [onDisconnect]);

  const src = streamId ? `http://localhost:8000/api/streams/${streamId}/video_feed` : '';

  return (
    <>
      <div style={{ width: '100%', height: '600px', backgroundColor: 'black' }}>
        {src ? <Image src={src} styles={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : null}
      </div>
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

const CapturedImagesContainer = (): JSX.Element => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { capturedImages } = useSelector<State, Part>((state) => state.part);

  useEffect(() => {
    dispatch(thunkGetCapturedImages());
  }, [dispatch]);

  return (
    <Flex column gap="gap.small">
      <Flex
        styles={{ overflow: 'scroll', border: '1px solid grey', height: '150px' }}
        gap="gap.small"
        vAlign="center"
      >
        {capturedImages.map((src) => (
          <Image key={src} src={src} design={{ maxWidth: '150px' }} />
        ))}
      </Flex>
      <Flex hAlign="end">
        <Button
          primary
          content="Label"
          disabled={capturedImages.length === 0}
          onClick={(): void => {
            history.push('/label');
          }}
        />
      </Flex>
    </Flex>
  );
};

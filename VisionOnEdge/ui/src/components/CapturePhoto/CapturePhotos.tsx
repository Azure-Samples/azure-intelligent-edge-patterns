import React, { useState, useEffect, useCallback } from 'react';
import { Flex, Dropdown, Button, Image, Text, DropdownItemProps } from '@fluentui/react-northstar';
import { Link, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { useCameras } from '../../hooks/useCameras';
import { State } from '../../store/State';
import { Part } from '../../store/part/partTypes';
import { Camera } from '../../store/camera/cameraTypes';
import { thunkGetCapturedImages, thunkAddCapturedImages } from '../../store/part/partActions';
import LabelingPageDialog from '../LabelingPageDialog';
import LabelDisplayImage from '../LabelDisplayImage';

export const CapturePhotos: React.FC = () => {
  const [selectedCamera, setSelectedCamera] = useState<Camera>(null);

  return (
    <>
      <CameraSelector setSelectedCamera={setSelectedCamera} />
      <RTSPVideo selectedCamera={selectedCamera} />
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

const RTSPVideo = ({ selectedCamera }): JSX.Element => {
  const [streamId, setStreamId] = useState<string>('');
  const dispatch = useDispatch();
  const { partId } = useParams();

  const onCreateStream = (): void => {
    fetch(`/api/streams/connect/?part_id=${partId}&rtsp=${selectedCamera.rtsp}`)
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
          {
            key: 'start',
            icon: 'play',
            iconOnly: true,
            onClick: onCreateStream,
            disabled: selectedCamera === null,
          },
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
  const { capturedImages } = useSelector<State, Part>((state) => state.part);

  useEffect(() => {
    dispatch(thunkGetCapturedImages());
  }, [dispatch]);

  return (
    <Flex
      styles={{ overflow: 'scroll', border: '1px solid grey', height: '150px' }}
      gap="gap.small"
      vAlign="center"
    >
      {capturedImages.map((image, i) => (
        <LabelingPageDialog
          key={i}
          imageIndex={i}
          trigger={
            <LabelDisplayImage imgSrc={image.image} pointerCursor width={300} height={150} imgPadding="0" />
          }
        />
      ))}
    </Flex>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import {
  Flex,
  Dropdown,
  Button,
  Image,
  Text,
  DropdownItemProps,
  PlayIcon,
  CallControlPresentNewIcon,
  PauseThickIcon,
} from '@fluentui/react-northstar';
import { Link, useParams, Prompt } from 'react-router-dom';
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
  const { partId } = useParams();

  return (
    <>
      <CameraSelector setSelectedCamera={setSelectedCamera} />
      <RTSPVideo selectedCamera={selectedCamera} partId={partId} />
      <CapturedImagesContainer partId={partId} />
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

const RTSPVideo = ({ selectedCamera, partId }): JSX.Element => {
  const [streamId, setStreamId] = useState<string>('');
  const dispatch = useDispatch();

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
            icon: <PlayIcon />,
            iconOnly: true,
            onClick: onCreateStream,
            disabled: selectedCamera === null,
          },
          {
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

const CapturedImagesContainer = ({ partId }): JSX.Element => {
  const dispatch = useDispatch();
  const { capturedImages, isValid } = useSelector<State, Part>((state) => state.part);

  useEffect(() => {
    dispatch(thunkGetCapturedImages(partId));
  }, [dispatch, partId]);

  return (
    <>
      {!isValid && <Text error>*Please capture and label more then 15 images</Text>}
      <Flex
        styles={{
          overflow: 'scroll',
          border: '1px solid grey',
          height: '150px',
          borderColor: isValid ? '' : 'red',
        }}
        gap="gap.small"
        vAlign="center"
      >
        {capturedImages.map((image, i) => (
          <div key={image.id}>
            <span>{i + 1}</span>
            <LabelingPageDialog
              key={i}
              imageIndex={i}
              trigger={<LabelDisplayImage labelImage={image} pointerCursor width={200} height={150} />}
            />
          </div>
        ))}
      </Flex>
      <Prompt
        when={capturedImages.length < 15}
        message="The count of images is less than 15, which may cause error when confugure part idetification. Sure you want to leave?"
      />
    </>
  );
};

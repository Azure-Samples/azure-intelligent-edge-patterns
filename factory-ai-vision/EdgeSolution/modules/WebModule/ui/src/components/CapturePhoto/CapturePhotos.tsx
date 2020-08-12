import React, { useState, useEffect } from 'react';
import { Flex, Dropdown, Text, DropdownItemProps } from '@fluentui/react-northstar';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { State } from 'RootStateType';
import { useCameras } from '../../hooks/useCameras';
import { Camera } from '../../store/camera/cameraTypes';
import { RTSPVideo } from '../RTSPVideo';
import { formatDropdownValue } from '../../util/formatDropdownValue';
import { CaptureLabelMode } from '../RTSPVideo/RTSPVideo.type';
import { captureImage, getImages } from '../../features/imageSlice';
import { makeLabelImageSelector } from '../../features/selectors';
import { CapturedImagesContainer } from '../CapturedImagesContainer';
import { LabelImage } from '../../features/type';

export const CapturePhotos: React.FC<{
  partId: number;
  partName: string;
}> = ({ partId, partName }) => {
  const dispatch = useDispatch();
  const [selectedCamera, setSelectedCamera] = useState<Camera>(null);
  const images = useSelector<State, LabelImage[]>(makeLabelImageSelector(partId));
  const availableCameras = useCameras();

  const onCapturePhoto = (streamId: string, mode: CaptureLabelMode): void => {
    dispatch(
      captureImage({
        streamId,
        imageIds: images.map((e) => e.id),
        shouldOpenLabelingPage: mode === CaptureLabelMode.PerImage,
      }),
    );
  };

  useEffect(() => {
    dispatch(getImages());
  }, [dispatch]);

  const autoPlay = availableCameras.length === 1 && !!selectedCamera;

  return (
    <Flex gap="gap.small" styles={{ height: '100%' }}>
      <Flex column gap="gap.small" styles={{ width: '70%', height: '100%' }}>
        <CameraSelector
          selectedCamera={selectedCamera}
          setSelectedCamera={setSelectedCamera}
          availableCameras={availableCameras}
        />
        <div style={{ minHeight: '600px', height: '100%' }}>
          <RTSPVideo
            rtsp={selectedCamera?.rtsp}
            partId={partId}
            partName={partName}
            canCapture={true}
            onCapturePhoto={onCapturePhoto}
            autoPlay={autoPlay}
          />
        </div>
      </Flex>
      <Flex column gap="gap.small" styles={{ width: '30%', minWidth: '450px', height: '100%' }}>
        <CapturedImagesContainer images={images} gridColumn={2} />
      </Flex>
    </Flex>
  );
};

const CameraSelector = ({ selectedCamera, setSelectedCamera, availableCameras }): JSX.Element => {
  const items: DropdownItemProps[] = availableCameras.map((ele) => ({
    header: ele.name,
    content: {
      key: ele.id,
    },
  }));

  const onDropdownChange = (_, data): void => {
    if (data.value === null) setSelectedCamera((prev) => prev);
    else {
      const { key } = data.value.content;
      const newSelectedCamera = availableCameras.find((ele) => ele.id === key);
      if (newSelectedCamera) setSelectedCamera(newSelectedCamera);
    }
  };

  // FIXME Find a better way to replace the setState in the effect
  useEffect(() => {
    if (availableCameras.length === 1) setSelectedCamera(availableCameras[0]);
  }, [availableCameras, setSelectedCamera]);

  return (
    <Flex gap="gap.small" vAlign="center">
      <Text>Select Camera</Text>
      <Dropdown items={items} onChange={onDropdownChange} value={formatDropdownValue(selectedCamera)} />
      <Link to="/cameras">Add Camera</Link>
    </Flex>
  );
};

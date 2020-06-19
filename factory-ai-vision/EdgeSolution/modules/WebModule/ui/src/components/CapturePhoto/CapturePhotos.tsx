import React, { useState, useEffect } from 'react';
import { Flex, Dropdown, Text, DropdownItemProps } from '@fluentui/react-northstar';
import { Link, Prompt } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { useCameras } from '../../hooks/useCameras';
import { State } from '../../store/State';
import { Camera } from '../../store/camera/cameraTypes';
import LabelingPageDialog from '../LabelingPageDialog';
import LabelDisplayImage from '../LabelDisplayImage';
import { RTSPVideo } from '../RTSPVideo';
import { getLabelImages } from '../../store/image/imageActions';
import { LabelImage } from '../../store/image/imageTypes';
import { getFilteredImages } from '../../util/getFilteredImages';
import { formatDropdownValue } from '../../util/formatDropdownValue';

export const CapturePhotos: React.FC<{ partId: number }> = ({ partId }) => {
  const [selectedCamera, setSelectedCamera] = useState<Camera>(null);

  return (
    <>
      <CameraSelector selectedCamera={selectedCamera} setSelectedCamera={setSelectedCamera} />
      <RTSPVideo rtsp={selectedCamera?.rtsp} partId={partId} canCapture={true} />
      <CapturedImagesContainer partId={partId} />
    </>
  );
};

const CameraSelector = ({ selectedCamera, setSelectedCamera }): JSX.Element => {
  const availableCameras = useCameras();

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

  return (
    <Flex gap="gap.small" vAlign="center">
      <Text>Select Camera</Text>
      <Dropdown items={items} onChange={onDropdownChange} value={formatDropdownValue(selectedCamera)} />
      <Link to="/addCamera">Add Camera</Link>
    </Flex>
  );
};

const CapturedImagesContainer = ({ partId }): JSX.Element => {
  const dispatch = useDispatch();
  const images = useSelector<State, LabelImage[]>((state) => state.images).filter(
    (image) => !image.is_relabel,
  );
  const filteredImages = getFilteredImages(images, { partId, isRelabel: false });
  const isValid = filteredImages.filter((image) => image.labels).length >= 15;

  useEffect(() => {
    dispatch(getLabelImages());
  }, [dispatch]);

  const imageCount = filteredImages.length;

  return (
    <>
      <Text>Total: {imageCount}</Text>
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
        {filteredImages.map((image, i, arr) => (
          <div key={image.id} style={{ height: '100%', width: '100%' }}>
            <span>{i + 1}</span>
            <LabelingPageDialog
              key={i}
              imageIndex={i}
              images={arr}
              trigger={<LabelDisplayImage labelImage={image} pointerCursor />}
              isRelabel={false}
            />
          </div>
        ))}
      </Flex>
      <Prompt
        when={imageCount < 15}
        message="The count of images is less than 15, which may cause error when configure part identification. Sure you want to leave?"
      />
    </>
  );
};

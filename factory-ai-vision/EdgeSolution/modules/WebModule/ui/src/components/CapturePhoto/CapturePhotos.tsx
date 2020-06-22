import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const dispatch = useDispatch();
  const [selectedCamera, setSelectedCamera] = useState<Camera>(null);
  const [goLabelImageIdx, setGoLabelImageIdx] = useState<number>(null);
  const [openLabelingPage, setOpenLabelingPage] = useState<boolean>(false);
  const images = useSelector<State, LabelImage[]>((state) => state.images);
  const filteredImages = getFilteredImages(images, { partId, isRelabel: false });
  const prevImageLength = useRef<number>(filteredImages.length);

  useEffect(() => {
    dispatch(getLabelImages());
  }, [dispatch]);
  useEffect(() => {
    if (openLabelingPage && prevImageLength.current !== filteredImages.length) {
      setGoLabelImageIdx(filteredImages.length - 1);
      setOpenLabelingPage(false);
      prevImageLength.current = filteredImages.length;
    }
  }, [openLabelingPage, filteredImages]);

  return (
    <>
      <CameraSelector selectedCamera={selectedCamera} setSelectedCamera={setSelectedCamera} />
      <RTSPVideo
        rtsp={selectedCamera?.rtsp}
        partId={partId}
        canCapture={true}
        setOpenLabelingPage={setOpenLabelingPage}
      />
      <CapturedImagesContainer images={filteredImages} goLabelImageIdx={goLabelImageIdx} />
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

const CapturedImagesContainer = ({ images, goLabelImageIdx }): JSX.Element => {
  const isValid = images.filter((image) => image.labels).length >= 15;
  const imageCount = images.length;

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
        {images.map((image, i, arr) => (
          <div key={image.id} style={{ height: '100%', width: '100%' }}>
            <span>{i + 1}</span>
            <LabelingPageDialog
              key={i}
              imageIndex={i}
              images={arr}
              forceOpen={goLabelImageIdx === i}
              trigger={
                <div style={{ height: 150, width: 200 }}>
                  <LabelDisplayImage labelImage={image} pointerCursor />
                </div>
              }
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

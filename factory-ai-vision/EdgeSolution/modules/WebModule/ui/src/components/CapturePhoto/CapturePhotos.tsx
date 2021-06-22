import React, { useState, useEffect, useRef, Dispatch } from 'react';
import { Flex, Dropdown, Text, DropdownItemProps, Grid } from '@fluentui/react-northstar';
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

export const CapturePhotos: React.FC<{
  partId: number;
  partName: string;
  goLabelImageIdx: number;
  setGoLabelImageIdx: Dispatch<number>;
}> = ({ partId, partName, goLabelImageIdx, setGoLabelImageIdx }) => {
  const dispatch = useDispatch();
  const [selectedCamera, setSelectedCamera] = useState<Camera>(null);
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
  }, [openLabelingPage, filteredImages, setGoLabelImageIdx]);

  return (
    <Flex gap="gap.small">
      <Flex column gap="gap.small" styles={{ width: '70%' }}>
        <CameraSelector selectedCamera={selectedCamera} setSelectedCamera={setSelectedCamera} />
        <RTSPVideo
          rtsp={selectedCamera?.rtsp}
          partId={partId}
          partName={partName}
          canCapture={true}
          setOpenLabelingPage={setOpenLabelingPage}
        />
      </Flex>
      <Flex column gap="gap.small" styles={{ width: '30%', minWidth: '450px' }}>
        <CapturedImagesContainer partId={partId} goLabelImageIdx={goLabelImageIdx} />
      </Flex>
    </Flex>
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

export const CapturedImagesContainer = ({ goLabelImageIdx, partId }): JSX.Element => {
  const images = useSelector<State, LabelImage[]>((state) => state.images);
  const filteredImages = getFilteredImages(images, { partId, isRelabel: false });
  const isValid = filteredImages.filter((image) => image.labels).length >= 15;
  const imageCount = filteredImages.length;

  return (
    <Flex column styles={{ height: '100%' }}>
      <Text>Total: {imageCount}</Text>
      {!isValid && <Text error>*Please capture and label more then 15 images</Text>}
      <Grid
        columns="2"
        styles={{
          border: '1px solid grey',
          gridGap: '10px',
          padding: '10px',
          borderColor: isValid ? '' : 'red',
          justifyItems: 'center',
          alignItems: 'center',
          overflow: 'scroll',
          maxHeight: '600px',
        }}
      >
        {filteredImages.map((image, i, arr) => (
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
      </Grid>
      <Prompt
        when={imageCount < 15}
        message="The count of images is less than 15, which may cause error when configure part identification. Sure you want to leave?"
      />
    </Flex>
  );
};

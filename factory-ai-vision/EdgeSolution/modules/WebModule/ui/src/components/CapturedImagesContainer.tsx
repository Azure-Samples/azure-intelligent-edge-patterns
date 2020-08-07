import React from 'react';
import { useDispatch } from 'react-redux';
import { Prompt } from 'react-router-dom';
import { Flex, Grid, Text } from '@fluentui/react-northstar';

import { openLabelingPage } from '../features/labelingPageSlice';
import LabelDisplayImage from './LabelDisplayImage';
import LabelingPage from './LabelingPage/LabelingPage';
import { LabelImage } from '../features/type';

type CapturedImagesContainer = {
  images: LabelImage[];
  gridColumn: number;
};

export const CapturedImagesContainer: React.FC<CapturedImagesContainer> = ({ images, gridColumn }) => {
  const dispatch = useDispatch();
  const isValid = images.filter((image) => image.labels).length >= 15;
  const imageCount = images.length;

  const onDisplayImageClick = (imageId: number): void => {
    dispatch(openLabelingPage({ imageIds: images.map((e) => e.id), selectedImageId: imageId }));
  };

  return (
    <Flex column styles={{ height: '100%' }}>
      <Text>Total: {imageCount}</Text>
      {!isValid && <Text error>*Please capture and label more then 15 images</Text>}
      <Grid
        columns={gridColumn}
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
        {images.map((image, i) => (
          <div key={image.id} style={{ height: '100%', width: '100%' }}>
            <span>{i + 1}</span>
            <div style={{ height: 150, width: 200 }}>
              <LabelDisplayImage
                labelImage={image}
                pointerCursor
                onClick={(): void => onDisplayImageClick(image.id)}
              />
            </div>
          </div>
        ))}
        <LabelingPage isRelabel={false} labelingType={0} />
      </Grid>
      <Prompt
        when={imageCount < 15}
        message={(location): string => {
          if (location.state === 'AFTER_DELETE') return;
          return 'The count of images is less than 15, which may cause error when configure part identification. Sure you want to leave?';
        }}
      />
    </Flex>
  );
};

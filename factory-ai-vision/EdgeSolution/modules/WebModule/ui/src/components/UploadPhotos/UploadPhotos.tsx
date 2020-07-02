import React, { useEffect } from 'react';
import { Text, Grid, Flex } from '@fluentui/react-northstar';
import { useDispatch, useSelector } from 'react-redux';

import { State } from '../../store/State';
import LabelingPageDialog from '../LabelingPageDialog';
import LabelDisplayImage from '../LabelDisplayImage';
import { getFilteredImages } from '../../util/getFilteredImages';
import { LabelImage } from '../../store/image/imageTypes';
import { getLabelImages, postLabelImage } from '../../store/image/imageActions';

export const UploadPhotos = ({ partId }): JSX.Element => {
  const dispatch = useDispatch();
  const images = useSelector<State, LabelImage[]>((state) => state.images);
  const filteredImages = getFilteredImages(images, { partId, isRelabel: false });
  const isValid = filteredImages.filter((image) => image.labels).length >= 15;

  useEffect(() => {
    dispatch(getLabelImages());
  }, [dispatch]);

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>): void {
    for (let i = 0; i < e.target.files.length; i++) {
      const formData = new FormData();
      formData.append('image', e.target.files[i]);
      formData.append('part', `/api/parts/${partId}/`);
      dispatch(postLabelImage(formData));
    }
  }

  return (
    <Flex gap="gap.smaller" column>
      <input type="file" onChange={handleUpload} accept="image/*" multiple />
      <CapturedImagesContainer capturedImages={filteredImages} isValid={isValid} partId={partId} />
    </Flex>
  );
};

const CapturedImagesContainer = ({ capturedImages, isValid, partId }): JSX.Element => {
  return (
    <>
      {!isValid && <Text error>*Please capture and label more then 15 images</Text>}
      <Grid
        columns="6"
        styles={{
          border: '1px solid grey',
          gridGap: '10px',
          padding: '10px',
          borderColor: isValid ? '' : 'red',
          justifyItems: 'center',
          alignItems: 'center',
          overflow: 'scroll',
        }}
      >
        {capturedImages.map((image, i, arr) => (
          <LabelingPageDialog
            key={i}
            imageIndex={i}
            images={arr}
            trigger={<LabelDisplayImage labelImage={image} pointerCursor />}
            isRelabel={false}
          />
        ))}
      </Grid>
    </>
  );
};

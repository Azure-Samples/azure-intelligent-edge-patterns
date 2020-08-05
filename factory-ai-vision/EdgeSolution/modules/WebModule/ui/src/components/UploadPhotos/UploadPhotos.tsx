import React, { useEffect } from 'react';
import { Flex } from '@fluentui/react-northstar';
import { useDispatch, useSelector } from 'react-redux';

import { State } from '../../store/State';
import { LabelImage } from '../../store/image/imageTypes';
import { getLabelImages, postLabelImage } from '../../store/image/imageActions';
import { makeLabelImageSelector } from '../../features/selectors';
import { CapturedImagesContainer } from '../CapturedImagesContainer';

export const UploadPhotos = ({ partId }): JSX.Element => {
  const dispatch = useDispatch();
  const images = useSelector<State, any[]>(makeLabelImageSelector(partId));

  useEffect(() => {
    dispatch(getLabelImages());
  }, [dispatch]);

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>): void {
    for (let i = 0; i < e.target.files.length; i++) {
      const formData = new FormData();
      formData.append('image', e.target.files[i]);
      formData.append('part', partId);
      dispatch(postLabelImage(formData));
    }
  }

  return (
    <Flex gap="gap.smaller" column>
      <input type="file" onChange={handleUpload} accept="image/*" multiple />
      <CapturedImagesContainer images={images} gridColumn={6} />
    </Flex>
  );
};

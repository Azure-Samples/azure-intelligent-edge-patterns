import React, { useEffect } from 'react';
import { Flex, Image } from '@fluentui/react-northstar';
import { useDispatch, useSelector } from 'react-redux';

import { State } from '../../store/State';
import { Part } from '../../store/part/partTypes';
import { thunkGetCapturedImages, addCapturedImages } from '../../store/part/partActions';
import LabelingPageDialog from '../LabelingPageDialog';

export const UploadPhotos = ({ partId }): JSX.Element => {
  const dispatch = useDispatch();
  const { capturedImages } = useSelector<State, Part>((state) => state.part);

  useEffect(() => {
    dispatch(thunkGetCapturedImages());
  }, [dispatch]);

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>): void {
    for (let i = 0; i < e.target.files.length; i++) {
      const formData = new FormData();
      formData.append('image', e.target.files[i]);
      formData.append('part', `http://localhost:8000/api/parts/${partId}/`);
      fetch(`/api/images/`, {
        method: 'POST',
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => dispatch(addCapturedImages(data)))
        .catch((err) => console.error(err));
    }
  }

  return (
    <>
      <input type="file" onChange={handleUpload} accept="image/*" multiple />
      <CapturedImagesContainer capturedImages={capturedImages} />
    </>
  );
};

const CapturedImagesContainer = ({ capturedImages }): JSX.Element => {
  return (
    <div style={{ border: '1px solid grey', height: '100%', padding: '10px' }}>
      <Flex gap="gap.medium" wrap>
        {capturedImages.map((image, i) => (
          <LabelingPageDialog
            key={i}
            imageIndex={i}
            trigger={
              <Image src={image.image} styles={{ cursor: 'pointer', width: '250px', margin: '5px' }} />
            }
          />
        ))}
      </Flex>
    </div>
  );
};

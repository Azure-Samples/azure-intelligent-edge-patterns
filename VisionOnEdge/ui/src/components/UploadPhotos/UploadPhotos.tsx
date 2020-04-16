import React, { useEffect } from 'react';
import { Flex, Image } from '@fluentui/react-northstar';
import { useDispatch, useSelector } from 'react-redux';

import { State } from '../../store/State';
import { Part } from '../../store/part/partTypes';
import { thunkGetCapturedImages } from '../../store/part/partActions';
import LabelingPageDialog from '../LabelingPageDialog';

export const UploadPhotos = ({ partId }): JSX.Element => {
  return (
    <>
      <input
        type="file"
        onChange={(e): void => {
          handleUpload(e, partId);
        }}
        accept="image/*"
        multiple
      />
      <CapturedImagesContainer />
    </>
  );
};

async function handleUpload(e: React.ChangeEvent<HTMLInputElement>, partId: number): Promise<void> {
  const requests: Promise<Response>[] = [];
  for (let i = 0; i < e.target.files.length; i++) {
    const formData = new FormData();
    formData.append('image', e.target.files[i]);
    requests.push(
      fetch(`/api/images/?part_id=${partId}/`, {
        method: 'POST',
        body: formData,
      }),
    );
  }

  try {
    const result = await Promise.all(requests);
    console.log(result);
  } catch (err) {
    console.error(err);
  }
}

const CapturedImagesContainer = (): JSX.Element => {
  const dispatch = useDispatch();
  const { capturedImages } = useSelector<State, Part>((state) => state.part);

  useEffect(() => {
    dispatch(thunkGetCapturedImages());
  }, [dispatch]);

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

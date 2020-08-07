import React, { FC, memo } from 'react';
import { Grid } from '@fluentui/react-northstar';
import ImageIdentificationItem from './ImageItem';
import { LabelImage } from '../../features/type';

interface ImagesContainerProps {
  images: LabelImage[];
  selectedPartId: number;
}
const ImagesContainer: FC<ImagesContainerProps> = ({ images, selectedPartId }) => (
  <Grid
    columns="2"
    styles={{
      width: '100%',
      height: '80%',
      overflow: 'scroll',
      borderWidth: '0.0625em',
      borderStyle: 'solid',
      rowGap: '10px',
    }}
  >
    {images.map((img, i) => (
      <ImageIdentificationItem
        key={img.id}
        confidenceLevel={img.confidence}
        relabelImage={img}
        partId={selectedPartId}
      />
    ))}
  </Grid>
);

export default memo(ImagesContainer);

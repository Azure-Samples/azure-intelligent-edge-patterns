import React, { FC, memo } from 'react';
import { Grid } from '@fluentui/react-northstar';
import ImageIdentificationItem from './ImageItem';
import { LabelImage } from '../../store/type';

interface ImagesContainerProps {
  images: LabelImage[];
  onDisplayImageClick: (imgId: number) => void;
}
const ImagesContainer: FC<ImagesContainerProps> = ({ images, onDisplayImageClick }) => (
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
    {images.map((img) => (
      <ImageIdentificationItem
        key={img.id}
        confidenceLevel={img.confidence}
        relabelImage={img}
        onDisplayImageClick={onDisplayImageClick}
      />
    ))}
  </Grid>
);

export default memo(ImagesContainer);

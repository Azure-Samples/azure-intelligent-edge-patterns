import React, { FC, Dispatch, memo } from 'react';
import { Grid } from '@fluentui/react-northstar';
import ImageIdentificationItem from './ImageItem';
import { JudgedImageList, RelabelImage } from './types';

interface ImagesContainerProps {
  images: RelabelImage[];
  judgedImageList: JudgedImageList;
  setJudgedImageList: Dispatch<JudgedImageList>;
  selectedPartId: number;
  partItems: any[];
}
const ImagesContainer: FC<ImagesContainerProps> = ({
  images,
  judgedImageList,
  setJudgedImageList,
  selectedPartId,
  partItems,
}) => {
  
  return (
    <Grid
      columns="2"
      styles={{
        width: '100%',
        height: '80%',
        borderStyle: 'solid',
        overflow: 'scroll',
        borderWidth: '0.0625em',
      }}
    >
      {images.map((img, i, arr) => {
        if (img.display) {
          let isPartCorrect: number = null;
          if (judgedImageList.correct.indexOf(img.id) >= 0) {
            isPartCorrect = 1;
          } else if (judgedImageList.incorrect.findIndex((e) => e.imageId === img.id) >= 0) {
            isPartCorrect = 0;
          }

          return (
            <ImageIdentificationItem
              key={img.id}
              confidenceLevel={img.confidenceLevel}
              imageIndex={i}
              relabelImages={arr}
              isPartCorrect={isPartCorrect}
              setJudgedImageList={setJudgedImageList}
              partId={selectedPartId}
              partItems={partItems}
            />
          );
        }
        return void 0;
      })}
    </Grid>
  );
};

export default memo(ImagesContainer);

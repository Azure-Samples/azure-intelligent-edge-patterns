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
        borderWidth: '1px',
      }}
    >
      {images.map((img, i) => {
        if (img.display) {
          let isPartCorrect: number = null;

          if (judgedImageList.correct.indexOf(img.id) >= 0) {
            isPartCorrect = 1;
          } else if (judgedImageList.incorrect.findIndex((e) => e.imageId === img.id) >= 0) {
            isPartCorrect = 0;
          }
          console.log(img, i);
          return (
            <ImageIdentificationItem
              key={i}
              confidenceLevel={img.confidenceLevel}
              imageIndex={i}
              relabelImage={img}
              isPartCorrect={isPartCorrect}
              setJudgedImageList={setJudgedImageList}
              partId={selectedPartId}
              partItems={partItems}
            />
          );
        }
        return <div key={i} />;
      })}
    </Grid>
  );
};

export default memo(ImagesContainer);

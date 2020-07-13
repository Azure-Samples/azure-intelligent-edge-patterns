import React, { SetStateAction, Dispatch, FC, memo } from 'react';
import { Text } from '@fluentui/react-northstar';
import LabelDisplayImage from '../LabelDisplayImage';
import LabelingPageDialog from '../LabelingPageDialog';
import { JudgedImageList, RelabelImage } from './types';

interface ImageIdentificationItemProps {
  confidenceLevel: number;
  relabelImages: RelabelImage[];
  imageIndex: number;
  setJudgedImageList: Dispatch<SetStateAction<JudgedImageList>>;
  partId: number;
  isPartCorrect: number;
}
const ImageIdentificationItem: FC<ImageIdentificationItemProps> = ({
  confidenceLevel,
  relabelImages,
  imageIndex,
  setJudgedImageList,
}) => {
  return (
    <div
      style={{
        minHeight: '16em',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <LabelingPageDialog
        imageIndex={imageIndex}
        images={relabelImages}
        isRelabel={true}
        setJudgedImageList={setJudgedImageList}
        trigger={
          <div
            style={{
              padding: '0.5em',
              height: '96%',
              flex: '1 0 0',
            }}
          >
            <LabelDisplayImage pointerCursor labelImage={relabelImages[imageIndex]} />
          </div>
        }
      />
      <div
        style={{
          height: '96%',
          maxHeight: '10em',
          flex: '1 0 0',
          display: 'flex',
          flexFlow: 'column',
          justifyContent: 'center',
        }}
      >
        <Text truncated>
          Confidence Level: <b>{confidenceLevel}%</b>
        </Text>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            height: '50%',
            padding: '0.2em',
          }}
        >
          <Text truncated>
            Part Name: <b>{relabelImages[imageIndex].part.name}</b>
          </Text>
        </div>
      </div>
    </div>
  );
};

export default memo(ImageIdentificationItem);

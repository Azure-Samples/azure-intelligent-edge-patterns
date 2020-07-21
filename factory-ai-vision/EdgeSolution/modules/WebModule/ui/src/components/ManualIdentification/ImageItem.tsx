import React, { FC, memo } from 'react';
import { Text } from '@fluentui/react-northstar';
import LabelDisplayImage from '../LabelDisplayImage';
import LabelingPageDialog from '../LabelingPageDialog';
import { LabelImage } from '../../store/image/imageTypes';

interface ImageIdentificationItemProps {
  confidenceLevel: number;
  relabelImages: LabelImage[];
  imageIndex: number;
  partId: number;
}
const ImageIdentificationItem: FC<ImageIdentificationItemProps> = ({
  confidenceLevel,
  relabelImages,
  imageIndex,
}) => {
  return (
    <div
      style={{
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
          Confidence Level: <b>{((confidenceLevel * 1000) | 0) / 10}%</b>
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

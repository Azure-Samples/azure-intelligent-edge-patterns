import React, { FC, memo } from 'react';
import { Text } from '@fluentui/react-northstar';
import LabelDisplayImage from '../LabelDisplayImage';
import { LabelImage } from '../../store/type';

interface ImageIdentificationItemProps {
  confidenceLevel: number;
  relabelImage: LabelImage;
  onDisplayImageClick: (imgId: number) => void;
}
const ImageIdentificationItem: FC<ImageIdentificationItemProps> = ({
  confidenceLevel,
  relabelImage,
  onDisplayImageClick,
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
      <div
        style={{
          padding: '0.5em',
          height: '96%',
          flex: '1 0 0',
        }}
      >
        <LabelDisplayImage
          pointerCursor
          labelImage={relabelImage}
          onClick={() => onDisplayImageClick(relabelImage.id)}
        />
      </div>
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
            Part Name: <b>{relabelImage.part.name}</b>
          </Text>
        </div>
      </div>
    </div>
  );
};

export default memo(ImageIdentificationItem);

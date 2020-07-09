import React, { useState, useEffect, SetStateAction, Dispatch, FC, memo } from 'react';
import { Text, RadioGroup } from '@fluentui/react-northstar';
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
  partId,
  isPartCorrect,
}) => {
  const [forceDialogOpen, setForceDialogOpen] = useState(false);

  const onRadioGroupChange = (_, newProps): void => {
    setJudgedImageList((prev) => {
      const next = [...prev];

      if (newProps.value === 1) {
        const idx = next.findIndex((e) => e.imageId === relabelImages[imageIndex].id);

        if (idx >= 0) next[idx] = { ...next[idx], partId };
        else next.push({ imageId: relabelImages[imageIndex].id, partId });
      } else if (newProps.value === 0) {
        const idx = next.findIndex((e) => e.imageId === relabelImages[imageIndex].id);

        if (idx >= 0) next[idx] = { ...next[idx], partId: null };
        else {
          next.push({
            imageId: relabelImages[imageIndex].id,
            partId: null,
          });
        }
      }
      return next;
    });

    if (newProps.value === 1) setForceDialogOpen(true);
  };

  useEffect(() => {
    setJudgedImageList([]);
  }, [setJudgedImageList]);

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
        forceOpen={forceDialogOpen}
        setForceOpen={setForceDialogOpen}
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
          <RadioGroup
            checkedValue={isPartCorrect}
            onCheckedValueChange={onRadioGroupChange}
            items={[
              {
                key: '1',
                label: 'Yes',
                value: 1,
              },
              {
                key: '0',
                label: 'No',
                value: 0,
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default memo(ImageIdentificationItem);

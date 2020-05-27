import React, { useState, useEffect, SetStateAction, Dispatch, FC, memo } from 'react';
import { Dropdown, DropdownItemProps, Flex, Text, Button, RadioGroup } from '@fluentui/react-northstar';
import LabelDisplayImage from '../LabelDisplayImage';
import LabelingPageDialog from '../LabelingPageDialog';
import { JudgedImageList, RelabelImage } from './types';

interface ImageIdentificationItemProps {
  confidenceLevel: number;
  relabelImages: RelabelImage[];
  imageIndex: number;
  setJudgedImageList: Dispatch<SetStateAction<JudgedImageList>>;
  partId: number;
  partItems: DropdownItemProps[];
  isPartCorrect: number;
}
const ImageIdentificationItem: FC<ImageIdentificationItemProps> = ({
  confidenceLevel,
  relabelImages,
  imageIndex,
  setJudgedImageList,
  partId,
  partItems,
  isPartCorrect,
}) => {
  const filteredPartItems = partItems.filter((e) => (e.content as any).key !== partId);
  const [selectedPartItem, setSelectedPartItem] = useState<DropdownItemProps>(filteredPartItems[0]);

  const onDropdownChange = (_, { value }): void => {
    if (value !== null) {
      setSelectedPartItem(value);
    }
  };

  useEffect(() => {
    setSelectedPartItem(filteredPartItems[0]);
  }, [filteredPartItems]);

  return (
    <Flex hAlign="center" padding="padding.medium">
      <div style={{ margin: '0.2em' }}>
        <LabelDisplayImage labelImage={relabelImages[imageIndex]} width={100} height={100} />
      </div>
      <Flex column gap="gap.smaller" styles={{ width: '30%' }}>
        <Text truncated>Confidence Level: {confidenceLevel}%</Text>
        <Flex>
          <RadioGroup
            checkedValue={isPartCorrect}
            onCheckedValueChange={(_, newProps): void => {
              setJudgedImageList((prev) => {
                if (newProps.value === 1) {
                  const idxInIncorrect = prev.incorrect.findIndex((e) => e.imageId === relabelImages[imageIndex].id);
                  const idxInCorrect = prev.correct.indexOf(relabelImages[imageIndex].id);
                  if (idxInIncorrect >= 0) prev.incorrect.splice(idxInIncorrect, 1);
                  if (idxInCorrect === -1) prev.correct.push(relabelImages[imageIndex].id);
                }
                if (newProps.value === 0) {
                  const idxInCorrect = prev.correct.indexOf(relabelImages[imageIndex].id);
                  const idxInIncorrect = prev.incorrect.findIndex((e) => e.imageId === relabelImages[imageIndex].id);
                  if (idxInCorrect >= 0) prev.correct.splice(idxInCorrect, 1);
                  if (idxInIncorrect === -1)
                    prev.incorrect.push({
                      imageId: relabelImages[imageIndex].id,
                      partId: (selectedPartItem.content as any).key,
                    });
                }
                return { ...prev };
              });
            }}
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
          {!isPartCorrect && filteredPartItems.length > 0 && (
            <Dropdown items={filteredPartItems} onChange={onDropdownChange} value={selectedPartItem} />
          )}
        </Flex>
        <LabelingPageDialog
          imageIndex={imageIndex}
          images={relabelImages}
          isRelabel={true}
          trigger={<Button primary content="Identify" disabled={!isPartCorrect} />}
        />
      </Flex>
    </Flex>
  );
};

export default memo(ImageIdentificationItem);

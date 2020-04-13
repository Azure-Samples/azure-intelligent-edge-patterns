import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { Flex, Button, Text } from '@fluentui/react-northstar';

import Scene from '../components/LabelingPage/Scene';
import { LabelingType } from '../store/labelingPage/labelingPageTypes';
import { State } from '../store/State';
import { LabelImage } from '../store/part/partTypes';

interface LabelingPageProps {
  labelingType: LabelingType;
  imageIndex: number;
  closeDialog: () => void;
}
const LabelingPage: FC<LabelingPageProps> = ({ labelingType, imageIndex, closeDialog }) => {
  const images = useSelector<State, LabelImage[]>((state) => state.part.capturedImages);
  // console.log(images);
  const imageUrls = images.map((e) => e.image);
  const imageIds = images.map((e) => e.id);
  
  return (
    <Flex column hAlign="center">
      <Text size="larger" weight="semibold">
        {' '}
        DRAW A RECTANGLE AROUND THE PART
      </Text>
      <Scene url={imageUrls[imageIndex]} labelingType={labelingType} />
      <Flex gap="gap.medium">
        <Flex gap="gap.medium">
          <Button
            primary
            content="Save"
            onClick={(): void => {
              console.log('Save');
            }}
          />
          <Button
            content="Cancel"
            onClick={(): void => {
              closeDialog();
            }}
          />
        </Flex>
      </Flex>
    </Flex>
  );
};

export default LabelingPage;

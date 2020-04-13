import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { Flex, Button, Text } from '@fluentui/react-northstar';

import Scene from '../components/LabelingPage/Scene';
import { LabelingType } from '../store/labelingPage/labelingPageTypes';
import { State } from '../store/State';

interface LabelingPageProps {
  labelingType: LabelingType;
  imageIndex: number;
  closeDialog: () => void;
}
const LabelingPage: FC<LabelingPageProps> = ({ labelingType, imageIndex, closeDialog }) => {
  const imageUrls = useSelector<State, string[]>((state) => state.part.capturedImages);

  return (
    <Flex column hAlign="center">
      <Text size="larger" weight="semibold"> DRAW A RECTANGLE AROUND THE PART</Text>
      <Scene url={imageUrls[imageIndex]} labelingType={labelingType} />
      <Flex gap="gap.medium">
        <Flex gap="gap.medium">
          <Button primary content="Save" />
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

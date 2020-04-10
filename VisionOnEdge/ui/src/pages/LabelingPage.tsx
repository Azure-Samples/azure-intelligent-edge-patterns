import React, { FC } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Text, Flex, Button } from '@fluentui/react-northstar';

import Scene from '../components/LabelingPage/Scene';
import { LabelingType } from '../store/labelingPage/labelingPageTypes';
import { State } from '../store/State';

interface LabelingPageProps {
  labelingType: LabelingType;
}
const LabelingPage: FC<LabelingPageProps> = ({ labelingType }) => {
  const imageUrls = useSelector<State, string[]>((state) => state.part.capturedImages);
  const history = useHistory();
  const { imageIndex } = useParams();

  return (
    <Flex column hAlign="center">
      <Text size="larger" align="center">
        DRAW A RECTANGLE AROUND THE PART
      </Text>
      <Scene url={imageUrls[parseInt(imageIndex, 10)]} labelingType={labelingType} />
      <Flex gap="gap.medium">
        <Flex gap="gap.medium">
          <Button primary content="Save" />
          <Button
            content="Cancel"
            onClick={(): void => {
              history.push('/parts');
            }}
          />
        </Flex>
      </Flex>
    </Flex>
  );
};

export default LabelingPage;

import React, { FC } from 'react';
import { Text, Flex, FlexItem } from '@fluentui/react-northstar';
import { useSelector } from 'react-redux';
import Scene from '../components/LabelingPage/Scene';
import { LabelingPageState, State } from '../State';

const LabelingPage: FC = () => {
  const labelingPageState = useSelector<State, LabelingPageState>(state => state.labelingPageState);
  return (
    <Flex column>
      <FlexItem align="center">
        <Text size="larger">DRAW A RECTANGLE AROUND THE PART</Text>
      </FlexItem>
      <Scene url="" />
    </Flex>
  );
};

export default LabelingPage;

import React, { useState, FC } from 'react';
import { useSelector } from 'react-redux';
import { Text, Flex, FlexItem, Button } from '@fluentui/react-northstar';

import Scene from '../components/LabelingPage/Scene';
import { State } from '../State';

// interface LabelingPageProps {

// }
const LabelingPage: FC = () => {
  const imageUrls = useSelector<State, string[]>((state) => state.part.capturedImages);
  const [frameIndex, setFrameIndex] = useState<number>(0);

  return (
    <Flex column>
      <FlexItem align="center">
        <Text size="larger">DRAW A RECTANGLE AROUND THE PART</Text>
      </FlexItem>
      <Scene url={imageUrls[frameIndex]} />
      <Flex gap="gap.medium">
        <Button content="Clear" />
        <Button primary content="Save" />
        <Button
          content="Previous"
          disabled={imageUrls.length < 2}
          onClick={(): void => setFrameIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length)}
        />
        <Button
          content="Next"
          disabled={imageUrls.length < 2}
          onClick={(): void => setFrameIndex((prev) => (prev + 1) % imageUrls.length)}
        />
      </Flex>
    </Flex>
  );
};

export default LabelingPage;

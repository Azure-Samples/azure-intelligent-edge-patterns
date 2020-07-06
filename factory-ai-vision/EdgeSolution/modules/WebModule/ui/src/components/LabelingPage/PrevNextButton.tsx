import React, { FC } from 'react';
import { Flex, Button, ChevronStartIcon, ChevronEndIcon, Tooltip } from '@fluentui/react-northstar';

interface PrevNextButtonProps {
  prevDisabled: boolean;
  nextDisabled: boolean;
  onPrevClick: () => void;
  onNextClick: () => void;
}
const PrevNextButton: FC<PrevNextButtonProps> = ({
  children,
  prevDisabled,
  nextDisabled,
  onPrevClick,
  onNextClick,
}) => {
  return (
    <Flex vAlign="center">
      {
        <Button
          text
          disabled={prevDisabled}
          icon={<ChevronStartIcon size="larger" />}
          onClick={onPrevClick}
        />
      }
      {children}
      {
        <Tooltip
          content="Save and Next"
          trigger={
            <Button
              text
              disabled={nextDisabled}
              icon={<ChevronEndIcon size="larger" />}
              onClick={onNextClick}
            />
          }
        />
      }
    </Flex>
  );
};

export default PrevNextButton;

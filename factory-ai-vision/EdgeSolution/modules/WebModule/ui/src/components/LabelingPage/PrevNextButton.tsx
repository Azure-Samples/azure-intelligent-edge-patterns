import React, { FC } from 'react';
import { Flex, Button, ChevronStartIcon, ChevronEndIcon } from '@fluentui/react-northstar';

interface PrevNextButtonProps {
  isRelabel: boolean;
  prevDisabled: boolean;
  nextDisabled: boolean;
  onPrevClick: () => void;
  onNextClick: () => void;
}
const PrevNextButton: FC<PrevNextButtonProps> = ({
  isRelabel,
  children,
  prevDisabled,
  nextDisabled,
  onPrevClick,
  onNextClick,
}) => {
  return (
    <Flex vAlign="center">
      {!isRelabel && (
        <Button
          text
          disabled={prevDisabled}
          icon={<ChevronStartIcon size="larger" />}
          onClick={onPrevClick}
        />
      )}
      {children}
      {!isRelabel && (
        <Button text disabled={nextDisabled} icon={<ChevronEndIcon size="larger" />} onClick={onNextClick} />
      )}
    </Flex>
  );
};

export default PrevNextButton;

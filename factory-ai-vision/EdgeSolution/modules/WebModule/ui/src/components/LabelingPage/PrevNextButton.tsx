import React, { FC } from 'react';
import {
  Flex,
  Button,
  ChevronStartIcon,
  ChevronEndIcon,
  mergeStyles,
  ComponentSlotStyle,
  ButtonProps,
} from '@fluentui/react-northstar';

interface PrevNextButtonProps {
  prevDisabled: boolean;
  nextDisabled: boolean;
  onPrevClick: () => void;
  onNextClick: () => void;
}

const chevronButtonStyle = (isNextBtn: boolean): ComponentSlotStyle<ButtonProps> => ({
  props,
}): ComponentSlotStyle => {
  const baseStyle = {
    border: '0px',
    boxShadow: '0px',
    backgroundColor: 'white',
    ':hover': { backgroundColor: '' },
    ':active': { backgroundColor: '' },
  };

  if (isNextBtn)
    return mergeStyles(baseStyle, {
      ':hover': { color: '#f27b25' },
      ':active': { color: '#d85f09' },
      ...(!props.disabled && { color: '#F06A09' }),
    })();

  return baseStyle;
};

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
          disabled={prevDisabled}
          icon={<ChevronStartIcon size="larger" />}
          onClick={onPrevClick}
          styles={chevronButtonStyle(false)}
        />
      }
      {children}
      {
        <div>
          <Button
            disabled={nextDisabled}
            icon={<ChevronEndIcon size="larger" />}
            onClick={onNextClick}
            styles={chevronButtonStyle(true)}
          />
          {!nextDisabled && <div style={{ position: 'absolute', padding: '10px' }}>Save & Next</div>}
        </div>
      }
    </Flex>
  );
};

export default PrevNextButton;

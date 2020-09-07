import React, { useState } from 'react';
import { ActionButton, getTheme, Separator } from '@fluentui/react';

const { palette } = getTheme();

type ExpandPanelProps = {
  titleHidden: string;
  titleVisible?: string;
  iconPosition?: 'start' | 'end';
  bottomBorder?: boolean;
};

export const ExpandPanel: React.FC<ExpandPanelProps> = ({
  titleHidden,
  titleVisible = titleHidden,
  iconPosition = 'start',
  bottomBorder = false,
  children,
}) => {
  const [showChildren, setShowChildren] = useState(false);

  const toggleShowChildren = () => setShowChildren((prev) => !prev);

  return (
    <div>
      {showChildren && children}
      <ActionButton
        iconProps={{ iconName: 'Chevrondown' }}
        styles={{
          rootHovered: {
            color: palette.black,
          },
          flexContainer: {
            flexDirection: iconPosition === 'end' ? 'row-reverse' : 'row',
          },
          iconHovered: {
            color: palette.black,
          },
          icon: {
            color: palette.black,
            transitionDuration: '0.3s',
          },
          iconChecked: {
            transform: 'rotate(180deg)',
            transitionDuration: '0.3s',
          },
        }}
        text={showChildren ? titleVisible : titleHidden}
        onClick={toggleShowChildren}
        checked={showChildren}
      />
      {bottomBorder && (
        <Separator
          styles={{
            root: {
              selectors: {
                '::before': {
                  background: palette.neutralQuaternary,
                },
              },
            },
          }}
        />
      )}
    </div>
  );
};

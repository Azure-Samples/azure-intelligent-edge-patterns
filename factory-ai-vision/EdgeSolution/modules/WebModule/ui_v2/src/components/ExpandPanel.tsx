import React, { useState } from 'react';
import { ActionButton, getTheme, Separator } from '@fluentui/react';

const { palette } = getTheme();

export const ExpandPanel: React.FC<{ titleHidden: string; titleVisible: string }> = ({
  titleHidden,
  titleVisible,
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
            flexDirection: 'row-reverse',
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
    </div>
  );
};

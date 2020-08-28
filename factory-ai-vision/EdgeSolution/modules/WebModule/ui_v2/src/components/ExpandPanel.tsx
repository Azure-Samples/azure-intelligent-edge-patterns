import React, { useState } from 'react';
import { ActionButton, getTheme } from '@fluentui/react';

const { palette } = getTheme();

export const ExpandPanel: React.FC<{ title: string }> = ({ title, children }) => {
  const [showChildren, setShowChildren] = useState(false);

  const toggleShowChildren = () => setShowChildren((prev) => !prev);

  return (
    <>
      <ActionButton
        iconProps={{ iconName: 'Chevrondown' }}
        styles={{
          rootHovered: {
            color: palette.black,
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
        text={title}
        onClick={toggleShowChildren}
        checked={showChildren}
      />
      {showChildren && children}
    </>
  );
};

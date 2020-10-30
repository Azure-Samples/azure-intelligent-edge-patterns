import React, { useState } from 'react';
import { ActionButton, getTheme, Separator, Stack, Text } from '@fluentui/react';

const { palette } = getTheme();

type ExpandPanelProps = {
  // The title text to be shown when the panel is hidden
  titleHidden: string;
  // The title text to be shown when the panel is expanded
  titleVisible?: string;
  // The position of the chevron icon
  iconPosition?: 'start' | 'end';
  bottomBorder?: boolean;
  suffix?: string;
};

export const ExpandPanel: React.FC<ExpandPanelProps> = ({
  titleHidden,
  titleVisible = titleHidden,
  iconPosition = 'start',
  bottomBorder = false,
  suffix = '',
  children,
}) => {
  const [showChildren, setShowChildren] = useState(false);

  const toggleShowChildren = () => setShowChildren((prev) => !prev);

  return (
    <div>
      {showChildren && iconPosition === 'end' && children}
      <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
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
              fontSize: '12px',
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
        <Text variant="small" styles={{ root: { color: palette.neutralPrimaryAlt } }}>
          {suffix}
        </Text>
      </Stack>
      {showChildren && iconPosition === 'start' && children}
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

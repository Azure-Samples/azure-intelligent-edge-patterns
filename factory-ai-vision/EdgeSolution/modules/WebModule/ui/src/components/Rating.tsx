import React from 'react';
import { Flex, StarIcon, ComponentSlotStyle } from '@fluentui/react-northstar';

export type RatingProps = {
  max: number;
  value: number;
  onChange: (rating: number) => void;
};

export const Rating: React.FC<RatingProps> = ({ max, value, onChange }) => {
  return (
    <Flex
      gap="gap.small"
      styles={({ theme: { siteVariables } }): ComponentSlotStyle => ({
        color: siteVariables.colorScheme.brand.foreground,
      })}
    >
      {Array.from({ length: max }).map((_, i) => (
        <StarIcon
          key={i + 1}
          size="large"
          styles={{ ':hover': { cursor: 'pointer' } }}
          outline={i + 1 > value}
          onClick={(): void => onChange(i + 1)}
        />
      ))}
    </Flex>
  );
};

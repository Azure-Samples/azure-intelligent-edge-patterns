import React from 'react';
import { Flex, Text } from '@fluentui/react-northstar';

type ListItemProps = {
  title: string;
  footerText?: string;
};

export const ListItem: React.FC<ListItemProps> = ({ title, footerText = '', children }) => {
  return (
    <div>
      <Flex vAlign="center" gap="gap.medium">
        <Text style={{ width: '200px' }} size="medium">{`${title}: `}</Text>
        {typeof children === 'string' || typeof children === 'number' ? (
          <Text size="medium">{children}</Text>
        ) : (
          children
        )}
      </Flex>
      <Text size="smallest" error>
        {footerText}
      </Text>
    </div>
  );
};

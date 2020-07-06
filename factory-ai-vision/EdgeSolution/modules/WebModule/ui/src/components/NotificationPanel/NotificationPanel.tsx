import React from 'react';
import { Flex, CloseIcon, Button, Card, CardHeader, CardBody, Text } from '@fluentui/react-northstar';

import { mainTheme } from '../../themes/mainTheme';

type NotificationPanelProps = {
  isOpen: boolean;
  onDismiss: Function;
};

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onDismiss }) => {
  const notifications = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5];
  return (
    <div
      style={{
        backgroundColor: '#fff',
        border: `solid ${mainTheme.siteVariables.colorScheme.brand.border} 1px`,
        height: '100%',
        width: '100%',
        visibility: isOpen ? 'visible' : 'hidden',
        overflow: 'scroll',
      }}
    >
      <Flex vAlign="center" space="between" styles={{ padding: '10px' }}>
        <h2>Notification</h2>
        <Button icon={<CloseIcon />} text iconOnly size="large" onClick={(): void => onDismiss()} />
      </Flex>
      <Flex column hAlign="center" gap="gap.medium" styles={{ padding: '10px' }}>
        {notifications.map((_, i) => (
          <Card
            key={i}
            styles={{
              height: '',
              border: mainTheme.siteVariables.colorScheme.brand.border,
              cursor: 'pointer',
              width: '280px',
            }}
          >
            <CardHeader>
              <Flex gap="gap.small">
                <Flex column>
                  <Text content="Training Job" weight="bold" />
                </Flex>
              </Flex>
            </CardHeader>
            <CardBody>Project is completed</CardBody>
          </Card>
        ))}
      </Flex>
    </div>
  );
};

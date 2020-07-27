import React, { useEffect } from 'react';
import { Flex, CloseIcon, Button, Card, CardHeader, CardBody, Text } from '@fluentui/react-northstar';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { mainTheme } from '../../themes/mainTheme';
import { State } from '../../store/State';
import { Notification } from '../../store/notification/notificationType';
import { getNotifications } from '../../store/notification/notificationActionCreators';

type NotificationPanelProps = {
  onDismiss: Function;
};

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ onDismiss }) => {
  const notifications = useSelector<State, Notification[]>((state) => state.notifications);
  const history = useHistory();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getNotifications());
  }, [dispatch]);

  return (
    <div
      style={{
        backgroundColor: '#fff',
        border: `solid ${mainTheme.siteVariables.colorScheme.brand.border} 1px`,
        height: '100%',
        width: '100%',
        overflow: 'scroll',
      }}
    >
      <Flex vAlign="center" space="between" styles={{ padding: '10px' }}>
        <h2>Notification</h2>
        <Button icon={<CloseIcon />} text iconOnly size="large" onClick={(): void => onDismiss()} />
      </Flex>
      <Flex column hAlign="center" gap="gap.medium" styles={{ padding: '10px' }}>
        {notifications.map((e) => (
          <Card
            key={e.id}
            styles={{
              height: '',
              border: mainTheme.siteVariables.colorScheme.brand.border,
              cursor: 'pointer',
              width: '280px',
            }}
            onClick={(): void => history.push(e.linkTo)}
          >
            <CardHeader>
              <Flex gap="gap.small">
                <Flex column>
                  <Text content={e.title} weight="bold" />
                </Flex>
              </Flex>
            </CardHeader>
            <CardBody>{e.content}</CardBody>
          </Card>
        ))}
      </Flex>
    </div>
  );
};

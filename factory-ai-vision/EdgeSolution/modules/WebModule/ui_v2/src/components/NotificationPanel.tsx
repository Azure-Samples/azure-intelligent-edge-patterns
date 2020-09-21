import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ActionButton, IconButton, Panel, Stack, Text } from '@fluentui/react';
import { useHistory } from 'react-router-dom';

import {
  getNotifications,
  clearAllNotifications,
  selectAllNotifications,
  deleteNotification,
  Notification,
} from '../store/notificationSlice';

type NotificationPanelProps = {
  isOpen: boolean;
  onDismiss: () => void;
};

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onDismiss }) => {
  const notifications = useSelector(selectAllNotifications);
  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    dispatch(getNotifications());
  }, [dispatch]);

  const clearAll = () => {
    dispatch(clearAllNotifications());
  };

  return (
    <Panel isOpen={isOpen} onDismiss={onDismiss} headerText="Notifications">
      <ActionButton iconProps={{ iconName: 'Delete' }} text="clear all" onClick={clearAll} />
      {notifications.map((n) => (
        <NotificationCard
          key={n.id}
          notification={n}
          onCancelClick={(id) => dispatch(deleteNotification(id))}
          onClick={() => {
            history.push(n.linkTo);
            onDismiss();
          }}
        />
      ))}
    </Panel>
  );
};

type NotificationCardProps = {
  notification: Notification;
  onClick: () => void;
  onCancelClick: (id: number) => void;
};

const notificationContainerStyles = {
  root: {
    border: '1px solid #EDEBE9',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    borderRadius: '2px',
    padding: '10px',
    marginTop: '10px',
    cursor: 'pointer',
  },
};

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onClick,
  onCancelClick,
}) => {
  return (
    <Stack tokens={{ childrenGap: 20 }} styles={notificationContainerStyles} onClick={onClick}>
      <Stack horizontal horizontalAlign="space-between">
        <Text variant="mediumPlus" styles={{ root: { fontWeight: 'bold' } }}>
          {notification.title}
        </Text>
        <IconButton
          iconProps={{ iconName: 'Cancel' }}
          onClick={(e) => {
            e.stopPropagation();
            onCancelClick(notification.id);
          }}
        />
      </Stack>
      <Text>{notification.content}</Text>
    </Stack>
  );
};

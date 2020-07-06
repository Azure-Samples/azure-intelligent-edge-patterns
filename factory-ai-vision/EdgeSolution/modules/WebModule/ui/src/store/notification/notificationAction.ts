import { AddNotificationAction, Notification, RemoveNotificationAction } from './notificationType';

export const addNotification = (newNotification: Notification): AddNotificationAction => ({
  type: 'ADD_NOTIFICATION',
  payload: { newNotification },
});

export const removeNotification = (id: string): RemoveNotificationAction => ({
  type: 'REMOVE_NOTIFICATION',
  payload: { id },
});

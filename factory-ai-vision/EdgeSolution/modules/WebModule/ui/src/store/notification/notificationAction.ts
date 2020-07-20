import uniqid from 'uniqid';

import { AddNotificationAction, RemoveNotificationAction, SetReadAction } from './notificationType';

export const addNotification = (newNotification: {
  title: string;
  content: string;
  linkTo: string;
}): AddNotificationAction => ({
  type: 'ADD_NOTIFICATION',
  payload: { newNotification: { id: uniqid, unRead: true, ...newNotification } },
});

export const removeNotification = (id: string): RemoveNotificationAction => ({
  type: 'REMOVE_NOTIFICATION',
  payload: { id },
});

export const setRead = (): SetReadAction => ({
  type: 'SET_READ',
});

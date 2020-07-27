import uniqid from 'uniqid';
import Axios from 'axios';

import { AddNotificationAction, RemoveNotificationAction, SetReadAction } from './notificationType';
import { CallAPIAction } from '../../middlewares/callAPIMiddleware';
import { State } from '../State';
import {
  GET_NOTIFICATIONS_REQUEST,
  GET_NOTIFICATIONS_SUCCESS,
  GET_NOTIFICATIONS_FAILURE,
} from '../../action';

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

export const getNotifications = (): CallAPIAction<State> => ({
  types: [GET_NOTIFICATIONS_REQUEST, GET_NOTIFICATIONS_SUCCESS, GET_NOTIFICATIONS_FAILURE],
  callAPI: (): Promise<void> => Axios.get('/api/notifications/').then(({ data }) => data),
  shouldCallAPI: (state): boolean => state.notifications.length === 0,
});

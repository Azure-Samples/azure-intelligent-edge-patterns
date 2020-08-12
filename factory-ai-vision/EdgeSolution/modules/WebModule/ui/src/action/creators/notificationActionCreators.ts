import Axios from 'axios';

import { CallAPIAction } from '../../middlewares/callAPIMiddleware';
import { State } from '../../store/State';
import {
  GET_NOTIFICATIONS_REQUEST,
  GET_NOTIFICATIONS_SUCCESS,
  GET_NOTIFICATIONS_FAILURE,
  DELETE_NOTIFICATION_REQUEST,
  DELETE_NOTIFICATION_FAILURE,
  DELETE_NOTIFICATION_SUCCESS,
  CLEAR_ALL_NOTIFICATION_REQUEST,
  CLEAR_ALL_NOTIFICATION_SUCCESS,
  CLEAR_ALL_NOTIFICATION_FAILURE,
  RECEIVE_NOTIFICATION,
  OPEN_NOTIFICATION_PANEL,
} from '../constants';
import { ReceiveNotification, OpenNotificationPanel } from '../type';

export const receiveNotification = (newNotification: any): ReceiveNotification => ({
  type: RECEIVE_NOTIFICATION,
  response: newNotification,
});

export const openNotificationPanel = (): OpenNotificationPanel => ({ type: OPEN_NOTIFICATION_PANEL });

export const getNotifications = (): CallAPIAction<State> => ({
  types: [GET_NOTIFICATIONS_REQUEST, GET_NOTIFICATIONS_SUCCESS, GET_NOTIFICATIONS_FAILURE],
  callAPI: (): Promise<void> => Axios.get('/api/notifications/').then(({ data }) => data),
  shouldCallAPI: (state): boolean => state.notifications.length === 0,
});

export const deleteNotification = (id: number): CallAPIAction<State> => ({
  types: [DELETE_NOTIFICATION_REQUEST, DELETE_NOTIFICATION_SUCCESS, DELETE_NOTIFICATION_FAILURE],
  callAPI: (): Promise<void> => Axios.delete(`/api/notifications/${id}/`).then(({ data }) => data),
  payload: { id },
});

export const clearAllNotifications = (): CallAPIAction<State> => ({
  types: [CLEAR_ALL_NOTIFICATION_REQUEST, CLEAR_ALL_NOTIFICATION_SUCCESS, CLEAR_ALL_NOTIFICATION_FAILURE],
  callAPI: async (state): Promise<void> => {
    const notificationIds = state.notifications.map((e) => e.id);
    // FIXME Wait for BE API
    const apis = notificationIds.map((id) => Axios.delete(`api/notifications/${id}`));
    await Promise.all(apis);
  },
});

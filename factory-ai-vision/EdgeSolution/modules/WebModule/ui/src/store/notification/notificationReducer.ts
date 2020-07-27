import { initialState } from '../State';
import { NotificationActions, Notification } from './notificationType';
import { ActionTypes } from '../../action';
import {
  GET_NOTIFICATIONS_SUCCESS,
  DELETE_NOTIFICATION_SUCCESS,
  RECEIVE_NOTIFICATION,
} from '../../action/constants';

const getLinkByNotificationType = (notificationType: string): string => {
  if (notificationType) {
    return '/partIdentification';
  }
  return '';
};

const getNormalizeNotification = (response: any, unRead: boolean): Notification => ({
  id: response.id,
  title: response.title,
  content: response.details,
  linkTo: getLinkByNotificationType(response.notification_type),
  unRead,
});

const notificationReducer = (
  state = initialState.notifications,
  action: NotificationActions | ActionTypes,
): Notification[] => {
  switch (action.type) {
    case RECEIVE_NOTIFICATION:
      return [getNormalizeNotification(action.response, true), ...state];
    case 'SET_READ':
      return state.map((e) => ({ ...e, unRead: false }));
    case GET_NOTIFICATIONS_SUCCESS:
      return action.response.map((e) => getNormalizeNotification(e, false));
    case DELETE_NOTIFICATION_SUCCESS:
      return state.filter((notif) => notif.id !== action.id);
    default:
      return state;
  }
};

export default notificationReducer;

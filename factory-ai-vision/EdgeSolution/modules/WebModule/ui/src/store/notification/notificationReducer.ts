import { initialState } from '../State';
import { NotificationActions, Notification } from './notificationType';
import { ActionTypes } from '../../action';
import { GET_NOTIFICATIONS_SUCCESS } from '../../action/constants';

const getLinkByNotificationType = (notificationType: string): string => {
  if (notificationType) {
    return '/partIdentification';
  }
  return '';
};

const notificationReducer = (
  state = initialState.notifications,
  action: NotificationActions | ActionTypes,
): Notification[] => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return [action.payload.newNotification, ...state];
    case 'REMOVE_NOTIFICATION':
      return state.filter((notif) => notif.id !== action.payload.id);
    case 'SET_READ':
      return state.map((e) => ({ ...e, unRead: false }));
    case GET_NOTIFICATIONS_SUCCESS:
      return action.response.map((e) => ({
        id: e.id,
        title: e.title,
        content: e.details,
        linkTo: getLinkByNotificationType(e.notification_type),
        unRead: false,
      }));
    default:
      return state;
  }
};

export default notificationReducer;

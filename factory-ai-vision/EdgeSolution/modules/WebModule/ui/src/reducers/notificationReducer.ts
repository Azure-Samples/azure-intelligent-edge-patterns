import { initialState } from '../store/State';
import {
  ActionTypes,
  RECEIVE_NOTIFICATION,
  OPEN_NOTIFICATION_PANEL,
  GET_NOTIFICATIONS_SUCCESS,
  DELETE_NOTIFICATION_SUCCESS
} from '../action';
import { Notification } from '../reducers/type';

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

const notificationReducer = (state = initialState.notifications, action: ActionTypes): Notification[] => {
  switch (action.type) {
    case RECEIVE_NOTIFICATION:
      return [getNormalizeNotification(action.response, true), ...state];
    case OPEN_NOTIFICATION_PANEL:
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

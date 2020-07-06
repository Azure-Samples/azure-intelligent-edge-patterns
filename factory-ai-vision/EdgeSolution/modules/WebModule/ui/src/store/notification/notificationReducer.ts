import { initialState } from '../State';
import { NotificationActions, Notification } from './notificationType';

const notificationReducer = (
  state = initialState.notifications,
  action: NotificationActions,
): Notification[] => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return [...state, action.payload.newNotification];
    case 'REMOVE_NOTIFICATION':
      return state.filter((notif) => notif.id !== action.payload.id);
    default:
      return state;
  }
};

export default notificationReducer;

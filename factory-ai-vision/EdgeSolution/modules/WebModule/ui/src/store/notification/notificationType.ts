export type Notification = {
  id: string;
  title: string;
  content: string;
  linkTo: string;
  unRead: boolean;
};

export type AddNotificationAction = {
  type: 'ADD_NOTIFICATION';
  payload: {
    newNotification: Notification;
  };
};

export type RemoveNotificationAction = {
  type: 'REMOVE_NOTIFICATION';
  payload: {
    id: string;
  };
};

export type SetReadAction = {
  type: 'SET_READ';
};

export type NotificationActions = AddNotificationAction | RemoveNotificationAction | SetReadAction;

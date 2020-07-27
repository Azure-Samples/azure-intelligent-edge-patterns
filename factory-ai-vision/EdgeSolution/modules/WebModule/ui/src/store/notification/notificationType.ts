export type Notification = {
  id: number;
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

export type SetReadAction = {
  type: 'SET_READ';
};

export type NotificationActions = AddNotificationAction | SetReadAction;

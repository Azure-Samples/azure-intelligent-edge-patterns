export type Notification = {
  id: string;
  title: string;
  content: string;
  linkTo: string;
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

export type NotificationActions = AddNotificationAction | RemoveNotificationAction;

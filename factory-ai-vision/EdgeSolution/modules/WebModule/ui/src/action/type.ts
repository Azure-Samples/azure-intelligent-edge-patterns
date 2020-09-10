/**
 * Define the shape of actions here
 * TODO: Move all the action type here
 */
import * as constants from './constants';
import { APIRequestAction, APISuccessAction, APIFailureAction } from '../middlewares/callAPIMiddleware';

/**
 * GET notifications
 */
export type GetNotificationsRequest = APIRequestAction<typeof constants.GET_NOTIFICATIONS_REQUEST>;
export type GetNotificationsSuccess = APISuccessAction<typeof constants.GET_NOTIFICATIONS_SUCCESS>;
export type GetNotificationsFailure = APIFailureAction<typeof constants.GET_NOTIFICATIONS_FAILURE>;

/**
 * DELETE notifications
 */
export type DeleteNotificationRequest = APIRequestAction<typeof constants.DELETE_NOTIFICATION_REQUEST>;
export type DeleteNotificationSuccess = APISuccessAction<
  typeof constants.DELETE_NOTIFICATION_SUCCESS,
  any,
  { id: number }
>;
export type DeleteNotificationFailure = APIFailureAction<typeof constants.DELETE_NOTIFICATION_FAILURE>;

/**
 * notifications from Websocket
 */
export type ReceiveNotification = {
  type: typeof constants.RECEIVE_NOTIFICATION;
  response: any;
};

/**
 * Open the Notification Panel Event
 */
export type OpenNotificationPanel = { type: typeof constants.OPEN_NOTIFICATION_PANEL };

export type ClearAllNotificationsRequest = APIRequestAction<typeof constants.CLEAR_ALL_NOTIFICATION_REQUEST>;
export type ClearAllNotificationsSuccess = APISuccessAction<typeof constants.CLEAR_ALL_NOTIFICATION_SUCCESS>;
export type ClearAllNotificationsFailure = APIFailureAction<typeof constants.CLEAR_ALL_NOTIFICATION_FAILURE>;

export type ActionTypes =
  | GetNotificationsRequest
  | GetNotificationsSuccess
  | GetNotificationsFailure
  | DeleteNotificationRequest
  | DeleteNotificationSuccess
  | DeleteNotificationFailure
  | ReceiveNotification
  | OpenNotificationPanel
  | ClearAllNotificationsRequest
  | ClearAllNotificationsSuccess
  | ClearAllNotificationsFailure;

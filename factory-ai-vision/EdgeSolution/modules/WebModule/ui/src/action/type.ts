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

/**
 * GET locations
 */
export type GetLocationRequest = APIRequestAction<typeof constants.GET_LOCATION_REQUEST>;
export type GetLocationSuccess = APISuccessAction<typeof constants.GET_LOCATION_SUCCESS>;
export type GetLocationFailure = APIFailureAction<typeof constants.GET_LOCATION_FAILURE>;

/**
 * POST locations
 */
export type PostLocationRequest = APIRequestAction<typeof constants.POST_LOCATION_REQUEST>;
export type PostLocationSuccess = APISuccessAction<typeof constants.POST_LOCATION_SUCCESS>;
export type PostLocationFailure = APIFailureAction<typeof constants.POST_LOCATION_FAILURE>;

/**
 * DELETE locations
 */
export type DeleteLocationRequest = APIRequestAction<typeof constants.DELETE_LOCATION_REQUEST>;
export type DeleteLocationSuccess = APISuccessAction<
  typeof constants.DELETE_LOCATION_SUCCESS,
  null,
  { id: number }
>;
export type DeleteLocationFaliure = APIFailureAction<typeof constants.DELETE_LOCATION_FAILURE>;

export type ActionTypes =
  | GetNotificationsRequest
  | GetNotificationsSuccess
  | GetNotificationsFailure
  | DeleteNotificationRequest
  | DeleteNotificationSuccess
  | DeleteNotificationFailure
  | ReceiveNotification
  | OpenNotificationPanel
  | GetLocationRequest
  | GetLocationFailure
  | GetLocationSuccess
  | PostLocationRequest
  | PostLocationSuccess
  | PostLocationFailure
  | PostLocationSuccess
  | DeleteLocationRequest
  | DeleteLocationSuccess
  | DeleteLocationFaliure;

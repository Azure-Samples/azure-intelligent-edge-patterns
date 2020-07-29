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

/**
 * GET parts
 */
export type GetPartsRequest = APIRequestAction<typeof constants.GET_PARTS_REQUEST>;
export type GetPartsSuccess = APISuccessAction<typeof constants.GET_PARTS_SUCCESS>;
export type GetPartsFailure = APIFailureAction<typeof constants.GET_PARTS_FAILURE>;

/**
 * POST parts
 */
export type PostPartRequest = APIRequestAction<typeof constants.POST_PART_REQUEST>;
export type PostPartSuccess = APISuccessAction<typeof constants.POST_PART_SUCCESS>;
export type PostPartFailure = APIFailureAction<typeof constants.POST_PART_FAILURE>;

/**
 * PUT parts
 */
export type PutPartRequest = APIRequestAction<typeof constants.PUT_PART_REQUEST>;
export type PutPartSuccess = APISuccessAction<typeof constants.PUT_PART_SUCCESS, any, { id: number }>;
export type PutPartFailure = APIFailureAction<typeof constants.PUT_PART_FAILURE>;

/**
 * DELETE parts
 */
export type DeletePartRequest = APIRequestAction<typeof constants.DELETE_PART_REQUEST>;
export type DeletePartSuccess = APISuccessAction<typeof constants.DELETE_PART_SUCCESS, null, { id: number }>;
export type DeletePartFaliure = APIFailureAction<typeof constants.DELETE_PART_FAILURE>;

/**
 * GET images
 */
export type GetImagesRequest = APIRequestAction<typeof constants.GET_IMAGES_REQUEST>;
export type GetImagesSuccess = APISuccessAction<typeof constants.GET_IMAGES_SUCCESS>;
export type GetImagesFailure = APIFailureAction<typeof constants.GET_IMAGES_FAILURE>;

/**
 * Capture image
 */
export type CaptureImagesRequest = APIRequestAction<typeof constants.CAPTURE_IMAGE_REQUEST>;
export type CaptureImagesSuccess = APISuccessAction<typeof constants.CAPTURE_IMAGE_SUCCESS>;
export type CaptureImagesFailure = APIFailureAction<typeof constants.CAPTURE_IMAGE_FAILURE>;

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
  | DeleteLocationRequest
  | DeleteLocationSuccess
  | DeleteLocationFaliure
  | GetPartsRequest
  | GetPartsFailure
  | GetPartsSuccess
  | PostPartRequest
  | PostPartSuccess
  | PostPartSuccess
  | PutPartRequest
  | PutPartSuccess
  | PutPartSuccess
  | DeletePartRequest
  | DeletePartSuccess
  | DeletePartFaliure
  | GetImagesRequest
  | GetImagesFailure
  | GetImagesSuccess
  | CaptureImagesRequest
  | CaptureImagesSuccess
  | CaptureImagesFailure;

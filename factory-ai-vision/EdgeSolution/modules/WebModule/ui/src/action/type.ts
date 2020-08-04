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
 * GET images
 */
export type GetImagesRequest = APIRequestAction<typeof constants.GET_IMAGES_REQUEST>;
export type GetImagesSuccess = APISuccessAction<typeof constants.GET_IMAGES_SUCCESS>;
export type GetImagesFailure = APIFailureAction<typeof constants.GET_IMAGES_FAILURE>;

/**
 * Capture image
 */
export type CaptureImagesRequest = APIRequestAction<typeof constants.CAPTURE_IMAGE_REQUEST>;
export type CaptureImagesSuccess = APISuccessAction<
  typeof constants.CAPTURE_IMAGE_SUCCESS,
  any,
  { shouldOpenLabelingPage: boolean; imageIds: number[] }
>;
export type CaptureImagesFailure = APIFailureAction<typeof constants.CAPTURE_IMAGE_FAILURE>;

/**
 * Label Page Action
 */
export type OpenLabelingPage = {
  type: typeof constants.OPEN_LABELING_PAGE;
  imageIds: number[];
  selectedImageId: number;
};
export type CloseLabelingPage = {
  type: typeof constants.CLOSE_LABELING_PAGE;
};

export type ActionTypes =
  | GetNotificationsRequest
  | GetNotificationsSuccess
  | GetNotificationsFailure
  | DeleteNotificationRequest
  | DeleteNotificationSuccess
  | DeleteNotificationFailure
  | ReceiveNotification
  | OpenNotificationPanel
  | GetImagesRequest
  | GetImagesFailure
  | GetImagesSuccess
  | CaptureImagesRequest
  | CaptureImagesSuccess
  | CaptureImagesFailure
  | OpenLabelingPage
  | CloseLabelingPage;

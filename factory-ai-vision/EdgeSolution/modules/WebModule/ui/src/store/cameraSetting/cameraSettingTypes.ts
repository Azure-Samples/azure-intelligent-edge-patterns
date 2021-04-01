import { ThunkAction, Action } from '@reduxjs/toolkit';
import { State } from 'RootStateType';

export type CameraSetting = {
  isCreating: boolean;
  isLoading: boolean;
  error: Error;
};

export enum CameraSettingAction {
  GET_CAMERA_SETTING_REQUEST = 'GET_CAMERA_SETTING_REQUEST',
  GET_CAMERA_SETTING_SUCCESS = 'GET_CAMERA_SETTING_SUCCESS',
  GET_CAMERA_SETTING_FAILURE = 'GET_CAMERA_SETTING_FAILURE',
  UPDATE_CAMERA_SETTING_REQUEST = 'UPDATE_CAMERA_SETTING_REQUEST',
  UPDATE_CAMERA_SETTING_SUCCESS = 'UPDATE_CAMERA_SETTING_SUCCESS',
  UPDATE_CAMERA_SETTING_FAILURE = 'UPDATE_CAMERA_SETTING_FAILURE',
  CANCEL_CAMERA_SETTING_REQUEST = 'CANCEL_CAMERA_SETTING_REQUEST',
  CANCEL_CAMERA_SETTING_SUCCESS = 'CANCEL_CAMERA_SETTING_SUCCESS',
  CANCEL_CAMERA_SETTING_FAILURE = 'CANCEL_CAMERA_SETTING_FAILURE',
}

export type GetCameraSettingRequestAction = {
  type: CameraSettingAction.GET_CAMERA_SETTING_REQUEST;
};

export type GetCameraSettingSuccessAction = {
  type: CameraSettingAction.GET_CAMERA_SETTING_SUCCESS;
  payload: boolean;
};

export type GetCameraSettingFailureAction = {
  type: CameraSettingAction.GET_CAMERA_SETTING_FAILURE;
  error: Error;
};

export type UpdateCameraSettingRequestAction = {
  type: CameraSettingAction.UPDATE_CAMERA_SETTING_REQUEST;
};

export type UpdateCameraSettingSuccessAction = {
  type: CameraSettingAction.UPDATE_CAMERA_SETTING_SUCCESS;
};

export type UpdateCameraSettingFailureAction = {
  type: CameraSettingAction.UPDATE_CAMERA_SETTING_FAILURE;
  error: Error;
};

export type CancelCameraSettingRequestAction = {
  type: CameraSettingAction.CANCEL_CAMERA_SETTING_REQUEST;
};

export type CancelCameraSettingSuccessAction = {
  type: CameraSettingAction.CANCEL_CAMERA_SETTING_SUCCESS;
};

export type CancelCameraSettingFailureAction = {
  type: CameraSettingAction.CANCEL_CAMERA_SETTING_FAILURE;
  error: Error;
};

export type ProjectActionTypes =
  | GetCameraSettingRequestAction
  | GetCameraSettingSuccessAction
  | GetCameraSettingFailureAction
  | UpdateCameraSettingRequestAction
  | UpdateCameraSettingSuccessAction
  | UpdateCameraSettingFailureAction
  | CancelCameraSettingRequestAction
  | CancelCameraSettingSuccessAction
  | CancelCameraSettingFailureAction;

// Describing the different THUNK ACTION NAMES available
export type ProjectThunk<ReturnType = void> = ThunkAction<ReturnType, State, unknown, Action<string>>;

/* eslint-disable @typescript-eslint/camelcase */
// import Axios from 'axios';

import {
  CameraSettingAction,
  GetCameraSettingRequestAction,
  GetCameraSettingSuccessAction,
  GetCameraSettingFailureAction,
  UpdateCameraSettingRequestAction,
  UpdateCameraSettingSuccessAction,
  UpdateCameraSettingFailureAction,
} from './cameraSettingTypes';

export const getCameraSettingRequest = (): GetCameraSettingRequestAction => ({
  type: CameraSettingAction.GET_CAMERA_SETTING_REQUEST,
});

export const getCameraSettingSuccess = (status: boolean): GetCameraSettingSuccessAction => ({
  type: CameraSettingAction.GET_CAMERA_SETTING_SUCCESS,
  payload: status,
});

export const getCameraSettingFailed = (error: Error): GetCameraSettingFailureAction => ({
  type: CameraSettingAction.GET_CAMERA_SETTING_FAILURE,
  error,
});

export const updateCameraSettingRequest = (): UpdateCameraSettingRequestAction => ({
  type: CameraSettingAction.UPDATE_CAMERA_SETTING_REQUEST,
});

export const updateCameraSettingSuccess = (): UpdateCameraSettingSuccessAction => ({
  type: CameraSettingAction.UPDATE_CAMERA_SETTING_SUCCESS,
});

export const updateCameraSettingFailed = (error: Error): UpdateCameraSettingFailureAction => ({
  type: CameraSettingAction.UPDATE_CAMERA_SETTING_FAILURE,
  error,
});

export const thunkUpdateCameraSetting = () => (dispatch) => {
  dispatch(updateCameraSettingSuccess());
};

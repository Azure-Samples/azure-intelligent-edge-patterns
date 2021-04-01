/* eslint-disable @typescript-eslint/camelcase */
import Axios from 'axios';

import {
  CameraSettingAction,
  GetCameraSettingRequestAction,
  GetCameraSettingSuccessAction,
  GetCameraSettingFailureAction,
  UpdateCameraSettingRequestAction,
  UpdateCameraSettingSuccessAction,
  UpdateCameraSettingFailureAction,
  CancelCameraSettingRequestAction,
  CancelCameraSettingSuccessAction,
  CancelCameraSettingFailureAction,
} from './cameraSettingTypes';
import { getErrorLog } from '../shared/createWrappedAsync';

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

export const cancelCameraSettingRequest = (): CancelCameraSettingRequestAction => ({
  type: CameraSettingAction.CANCEL_CAMERA_SETTING_REQUEST,
});

export const cancelCameraSettingSuccess = (): CancelCameraSettingSuccessAction => ({
  type: CameraSettingAction.CANCEL_CAMERA_SETTING_SUCCESS,
});

export const cancelCameraSettingFailed = (error: Error): CancelCameraSettingFailureAction => ({
  type: CameraSettingAction.CANCEL_CAMERA_SETTING_FAILURE,
  error,
});

export const thunkUpdateCameraSetting = () => (dispatch) => {
  dispatch(updateCameraSettingSuccess());
};

export const thunkCancelCameraSetting = () => (dispatch) => {
  dispatch(cancelCameraSettingRequest());

  return Axios.get('/cancel_upload')
    .then(() => {
      dispatch(cancelCameraSettingSuccess());
    })
    .catch((err) => {
      dispatch(cancelCameraSettingFailed(err));
      alert(getErrorLog(err));
    });
};

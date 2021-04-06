import { CameraSetting, CameraSettingAction, ProjectActionTypes } from './cameraSettingTypes';

export const initialState: CameraSetting = {
  isCreating: true,
  isLoading: false,
  error: null,
};

const projectReducer = (state = initialState, action: ProjectActionTypes): CameraSetting => {
  switch (action.type) {
    case CameraSettingAction.GET_CAMERA_SETTING_REQUEST:
      return { ...state, isLoading: true, error: null };
    case CameraSettingAction.GET_CAMERA_SETTING_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isCreating: action.payload,
      };
    case CameraSettingAction.GET_CAMERA_SETTING_FAILURE:
      return { ...state, isLoading: false, error: action.error };
    case CameraSettingAction.UPDATE_CAMERA_SETTING_REQUEST:
      return { ...state, isLoading: true, error: null };
    case CameraSettingAction.UPDATE_CAMERA_SETTING_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isCreating: true,
      };
    case CameraSettingAction.UPDATE_CAMERA_SETTING_FAILURE:
      return { ...state, isLoading: false, error: action.error };
    case CameraSettingAction.CANCEL_CAMERA_SETTING_REQUEST:
      return { ...state, isLoading: true, error: null };
    case CameraSettingAction.CANCEL_CAMERA_SETTING_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isCreating: false,
      };
    case CameraSettingAction.CANCEL_CAMERA_SETTING_FAILURE:
      return { ...state, isLoading: false, error: action.error };
    default:
      return { ...state };
  }
};

export default projectReducer;

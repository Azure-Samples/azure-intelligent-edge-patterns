import {
  GET_CAMERA_SUCCESS,
  REQUEST_CAMERA_FAILURE,
  POST_CAMERA_SUCCESS,
  Camera,
  CameraAction,
} from './cameraTypes';
import { initialState } from '../State';

const camerasReducer = (state = initialState.cameras, action: CameraAction): Camera[] => {
  switch (action.type) {
    case GET_CAMERA_SUCCESS:
      return action.payload;
    case REQUEST_CAMERA_FAILURE:
      return state;
    case POST_CAMERA_SUCCESS:
      return state.concat(action.payload);
    default:
      return state;
  }
};

export default camerasReducer;

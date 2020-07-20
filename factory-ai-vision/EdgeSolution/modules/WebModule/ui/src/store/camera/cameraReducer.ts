import {
  GET_CAMERA_SUCCESS,
  REQUEST_CAMERA_FAILURE,
  POST_CAMERA_SUCCESS,
  Camera,
  CameraAction,
  DELETE_CAMERA_SUCCESS,
  PATCH_CAMERA_AREA_REQUEST,
  PATCH_CAMERA_AREA_SUCCESS,
  PATCH_CAMERA_AREA_FAILED,
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
    case DELETE_CAMERA_SUCCESS: {
      const idx = state.findIndex((e) => e.id === action.payload.id);
      if (idx !== -1) return state.slice(0, idx).concat(state.slice(idx + 1));
      return state;
    }
    case PATCH_CAMERA_AREA_REQUEST:
      return state;
    case PATCH_CAMERA_AREA_SUCCESS:
      return state.map((e) => {
        if (e.id === action.payload.id) return action.payload.data;
        return e;
      });
    case PATCH_CAMERA_AREA_FAILED:
      return state;
    default:
      return state;
  }
};

export default camerasReducer;

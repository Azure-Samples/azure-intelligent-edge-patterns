import { GET_CAMERA_SUCCESS, REQUEST_CAMERA_FAILURE, POST_CAMERA_SUCCESS } from '../actions/cameras';
import { initialState, Camera } from '../State';

const camerasReducer = (state = initialState.cameras, action): Camera[] => {
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

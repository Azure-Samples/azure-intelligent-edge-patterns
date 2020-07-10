import {
  GET_LABEL_IMAGE_SUCCESS,
  REQUEST_LABEL_IMAGE_FAILURE,
  POST_LABEL_IMAGE_SUCCESS,
  DELETE_LABEL_IMAGE_SUCCESS,
  LabelImageAction,
  LabelImage,
  UPDATE_LABEL_IMAGE_ANNOTATION,
} from './imageTypes';
import { initialState } from '../State';

const labelImagesReducer = (state = initialState.images, action: LabelImageAction): LabelImage[] => {
  switch (action.type) {
    case GET_LABEL_IMAGE_SUCCESS:
      return action.payload;
    case REQUEST_LABEL_IMAGE_FAILURE:
      return state;
    case POST_LABEL_IMAGE_SUCCESS:
      return state.concat(action.payload);
    case DELETE_LABEL_IMAGE_SUCCESS: {
      const idx = state.findIndex((e) => e.id === action.payload.id);
      if (idx !== -1) return state.slice(0, idx).concat(state.slice(idx + 1));
      return state;
    }
    case UPDATE_LABEL_IMAGE_ANNOTATION: {
      const newState = [...state];
      const updatedImageIdx = newState.findIndex((e) => e.id === action.payload.id);
      newState[updatedImageIdx] = {
        ...newState[updatedImageIdx],
        labels: action.payload.labels,
        part: action.payload.part,
      };
      return newState;
    }
    default:
      return state;
  }
};

export default labelImagesReducer;

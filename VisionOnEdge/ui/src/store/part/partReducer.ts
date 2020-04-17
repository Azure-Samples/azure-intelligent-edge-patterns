import { initialState } from '../State';
import {
  PartActionTypes,
  ADD_CAPTURED_IMAGE,
  Part,
  UPDATE_CAPTURED_IMAGES,
  UPDATE_IMAGE_LABEL,
} from './partTypes';

const partReducer = (state = initialState.part, action: PartActionTypes): Part => {
  switch (action.type) {
    case ADD_CAPTURED_IMAGE:
      return { capturedImages: [...state.capturedImages, action.payload.newCapturedImage] };
    case UPDATE_CAPTURED_IMAGES:
      return { capturedImages: action.payload.capturedImages };
    case UPDATE_IMAGE_LABEL: {
      const newState = { ...state };
      const updatedImageIdx = newState.capturedImages.findIndex((e) => e.id === action.payload.id);
      newState.capturedImages[updatedImageIdx] = {
        ...newState.capturedImages[updatedImageIdx],
        labels: action.payload.labels,
      };
      return newState;
    }
    default:
      return state;
  }
};

export default partReducer;

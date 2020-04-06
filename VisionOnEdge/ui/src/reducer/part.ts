import { initialState, Part } from '../State';
import { PartActionTypes, ADD_CAPTURED_IMAGE, UPDATE_CAPTURED_IMAGES } from '../actions/part';

const partReducer = (state = initialState.part, action: PartActionTypes): Part => {
  switch (action.type) {
    case ADD_CAPTURED_IMAGE:
      return { capturedImages: [...state.capturedImages, action.payload.newCapturedImage] };
    case UPDATE_CAPTURED_IMAGES:
      return { capturedImages: action.payload.capturedImages };
    default:
      return state;
  }
};

export default partReducer;

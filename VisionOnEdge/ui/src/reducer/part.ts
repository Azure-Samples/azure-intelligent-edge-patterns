import { initialState, Part } from '../State';
import { PartActionTypes, ADD_CAPTURED_IMAGE } from '../actions/part';

const partReducer = (state = initialState.part, action: PartActionTypes): Part => {
  switch (action.type) {
    case ADD_CAPTURED_IMAGE:
      return { capturedImages: [...state.capturedImages, action.payload.newCapturedImage] };
    default:
      return state;
  }
};

export default partReducer;

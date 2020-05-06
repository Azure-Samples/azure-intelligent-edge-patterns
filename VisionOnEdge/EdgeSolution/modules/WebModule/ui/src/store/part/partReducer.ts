import { initialState } from '../State';
import {
  PartActionTypes,
  ADD_CAPTURED_IMAGE,
  Part,
  UPDATE_CAPTURED_IMAGES,
} from './partTypes';

const partReducer = (state = initialState.part, action: PartActionTypes): Part => {
  switch (action.type) {
    case ADD_CAPTURED_IMAGE:
      return { ...state, capturedImages: [...state.capturedImages, action.payload.newCapturedImage] };
    case UPDATE_CAPTURED_IMAGES:
      return { ...state, capturedImages: action.payload.capturedImages };
    default:
      return state;
  }
};

type PartReducerType = typeof partReducer;
const checkIfImagesCountIsValidToTrain = (reducer: PartReducerType) => (
  state = initialState.part,
  action: PartActionTypes,
): Part => {
  const newState = reducer(state, action);
  const isValid = newState.capturedImages.filter((image) => image.labels).length >= 15;
  return { ...newState, isValid };
};

export default checkIfImagesCountIsValidToTrain(partReducer);

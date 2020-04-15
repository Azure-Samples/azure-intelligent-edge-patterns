import { ThunkAction } from 'redux-thunk';
import { Action } from 'redux';

export type LabelImage = {
  id?: number;
  image: string;
  labels: any;
}
// Describing the shape of the chat's slice of state
export type Part = { capturedImages: LabelImage[] };

// Describing the different ACTION NAMES available
export const ADD_CAPTURED_IMAGE = 'ADD_CAPTURED_IMAGE';

export type AddCapturedImageAction = {
  type: typeof ADD_CAPTURED_IMAGE;
  payload: {
    newCapturedImage: LabelImage;
  };
};

export const UPDATE_CAPTURED_IMAGES = 'UPDATE_CAPTURED_IMAGES';

export type UpdateCapturedImageAction = {
  type: typeof UPDATE_CAPTURED_IMAGES;
  payload: {
    capturedImages: LabelImage[];
  };
};

export const UPDATE_IMAGE_LABEL = 'UPDATE_IMAGE_LABEL';

export type UpdateImageLabelAction = {
  type: typeof UPDATE_IMAGE_LABEL;
  payload: {
    id: number;
    labels: any;
  };
};

export type PartActionTypes = AddCapturedImageAction | UpdateCapturedImageAction | UpdateImageLabelAction;

// Describing the different THUNK ACTION NAMES available
export type PartThunk<ReturnType = void> = ThunkAction<ReturnType, Part, unknown, Action<string>>;

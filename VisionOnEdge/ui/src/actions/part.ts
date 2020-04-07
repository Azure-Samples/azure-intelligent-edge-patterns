import { ThunkAction } from 'redux-thunk';
import { Action } from 'redux';

import { Part } from '../State';

export const ADD_CAPTURED_IMAGE = 'ADD_CAPTURED_IMAGE';
export const UPDATE_CAPTURED_IMAGES = 'UPDATE_CAPTURED_IMAGES';

type AddCapturedImageAction = {
  type: typeof ADD_CAPTURED_IMAGE;
  payload: {
    newCapturedImage: string;
  };
};

type UpdateCapturedImageAction = {
  type: typeof UPDATE_CAPTURED_IMAGES;
  payload: {
    capturedImages: string[];
  };
};

type PartThunk<ReturnType = void> = ThunkAction<ReturnType, Part, unknown, Action<string>>;

export type PartActionTypes = AddCapturedImageAction | UpdateCapturedImageAction;

export const addCapturedImages = (newCapturedImage: string): AddCapturedImageAction => ({
  type: ADD_CAPTURED_IMAGE,
  payload: { newCapturedImage },
});

export const updateCapturedImages = (capturedImages: string[]): UpdateCapturedImageAction => ({
  type: UPDATE_CAPTURED_IMAGES,
  payload: { capturedImages },
});

export const thunkAddCapturedImages = (streamId: string): PartThunk => async (dispatch): Promise<void> => {
  fetch(`/api/streams/${streamId}/capture`)
    .then((response) => response.json())
    .then((data) => {
      if (data.status === 'ok') {
        dispatch(addCapturedImages(data.image.image));
      }
      return null;
    })
    .catch((err) => {
      console.error(err);
    });
};

export const thunkGetCapturedImages = (): PartThunk => async (dispatch): Promise<void> => {
  fetch(`/api/images`)
    .then((response) => response.json())
    .then((data) => {
      dispatch(updateCapturedImages(data.map((ele) => ele.image)));
      return null;
    })
    .catch((err) => {
      console.error(err);
    });
};

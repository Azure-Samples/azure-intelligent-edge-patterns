import { ThunkAction } from 'redux-thunk';
import { Action } from 'redux';

import { Part } from '../State';

export const ADD_CAPTURED_IMAGE = 'ADD_CAPTURED_IMAGE';

type AddCapturedImageAction = {
  type: typeof ADD_CAPTURED_IMAGE;
  payload: {
    newCapturedImage: string;
  };
};

type PartThunk<ReturnType = void> = ThunkAction<ReturnType, Part, unknown, Action<string>>;

export type PartActionTypes = AddCapturedImageAction;

export const addCapturedImages = (newCapturedImage: string): AddCapturedImageAction => ({
  type: ADD_CAPTURED_IMAGE,
  payload: { newCapturedImage },
});

export const thunkGetCapturedImages = (streamId: string): PartThunk => async (dispatch): Promise<void> => {
  fetch(`/streams/${streamId}/capture`)
    .then((response) => response.json())
    .then(() => {
      // TODO Append image url from server
      dispatch(addCapturedImages('https://via.placeholder.com/150'));
      return null;
    })
    .catch((err) => {
      console.error(err);
    });
};

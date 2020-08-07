/**
 * Put the share actions which may cause dependency cycle here.
 */

import { createAction, nanoid, ThunkAction, Action } from '@reduxjs/toolkit';
import { Position2D } from './type';
import { State } from '../store/State';

export const createAnnotation = createAction(
  'label/createAnnotation',
  (point: Position2D, imageId: number) => ({
    payload: {
      id: nanoid(),
      point,
      imageId,
    },
  }),
);

export const thunkCreateAnnotation = (
  point: Position2D,
): ThunkAction<void, State, unknown, Action<string>> => (dispatch, getState) => {
  const id = getState().labelingPage.selectedImageId;
  dispatch(createAnnotation(point, id));
};

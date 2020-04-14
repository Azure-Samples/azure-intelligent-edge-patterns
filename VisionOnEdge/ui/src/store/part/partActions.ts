import {
  AddCapturedImageAction,
  ADD_CAPTURED_IMAGE,
  PartThunk,
  UpdateCapturedImageAction,
  UPDATE_CAPTURED_IMAGES,
  LabelImage,
} from './partTypes';

export const addCapturedImages = (newCapturedImage: LabelImage): AddCapturedImageAction => ({
  type: ADD_CAPTURED_IMAGE,
  payload: { newCapturedImage },
});

export const updateCapturedImages = (capturedImages: LabelImage[]): UpdateCapturedImageAction => ({
  type: UPDATE_CAPTURED_IMAGES,
  payload: { capturedImages },
});

export const thunkAddCapturedImages = (streamId: string): PartThunk => async (dispatch): Promise<void> => {
  fetch(`/api/streams/${streamId}/capture`)
    .then((response) => response.json())
    .then((data) => {
      if (data.status === 'ok') {
        dispatch(addCapturedImages(data.image));
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
      dispatch(updateCapturedImages(data));
      return null;
    })
    .catch((err) => {
      console.error(err);
    });
};

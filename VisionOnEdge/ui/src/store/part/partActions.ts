import {
  AddCapturedImageAction,
  ADD_CAPTURED_IMAGE,
  PartThunk,
  UpdateCapturedImageAction,
  UPDATE_CAPTURED_IMAGES,
} from './partTypes';

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

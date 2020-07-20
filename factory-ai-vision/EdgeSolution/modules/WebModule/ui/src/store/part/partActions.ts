import {
  AddCapturedImageAction,
  ADD_CAPTURED_IMAGE,
  PartThunk,
  UpdateCapturedImageAction,
  UPDATE_CAPTURED_IMAGES,
} from './partTypes';
import { LabelImage } from '../image/imageTypes';
import { postLabelImageSuccess } from '../image/imageActions';

export const addCapturedImages = (newCapturedImage: LabelImage): AddCapturedImageAction => ({
  type: ADD_CAPTURED_IMAGE,
  payload: { newCapturedImage },
});

export const updateCapturedImages = (capturedImages: LabelImage[]): UpdateCapturedImageAction => ({
  type: UPDATE_CAPTURED_IMAGES,
  payload: { capturedImages },
});

export const thunkAddCapturedImages = (streamId: string, partName: string): PartThunk => async (
  dispatch,
): Promise<void> => {
  fetch(`/api/streams/${streamId}/capture`)
    .then((response) => response.json())
    .then((data) => {
      if (data.status === 'ok') {
        const labelImage = { ...data.image, part: { id: data.image.part, name: partName } };
        dispatch(addCapturedImages(labelImage));
        dispatch(postLabelImageSuccess(labelImage));
      }
      return null;
    })
    .catch((err) => {
      console.error(err);
    });
};

export const thunkGetCapturedImages = (partId: string): PartThunk => async (dispatch): Promise<void> => {
  fetch(`/api/images`)
    .then((response) => response.json())
    .then((data) => {
      const imagesWithRelatedPart = data.reduce((acc, cur) => {
        if (cur.part === partId) acc.push(cur);
        return acc;
      }, []);
      dispatch(updateCapturedImages(imagesWithRelatedPart));
      return null;
    })
    .catch((err) => {
      console.error(err);
    });
};

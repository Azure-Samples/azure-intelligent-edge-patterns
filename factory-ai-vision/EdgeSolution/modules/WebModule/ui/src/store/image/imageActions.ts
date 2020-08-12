import axios from 'axios';
import {
  LabelImage,
  GetLabelImagesSuccess,
  GET_LABEL_IMAGE_SUCCESS,
  DeleteLabelImageSuccess,
  DELETE_LABEL_IMAGE_SUCCESS,
  REQUEST_LABEL_IMAGE_FAILURE,
  PostLabelImageSuccess,
  POST_LABEL_IMAGE_SUCCESS,
  UPDATE_LABEL_IMAGE_ANNOTATION,
  UpdateLabelImageAnnotation,
  REMOVE_IMAGES_FROM_PART,
  RemoveImagesFromPartAction,
  UpdateRelabelRequestAction,
  UPDATE_RELABEL_REQUEST,
  UPDATE_RELABEL_SUCCESS,
  UPDATE_RELABEL_FAILED,
  UpdateRelabelSuccessAction,
  UpdateRelabelFailedAction,
} from './imageTypes';
import { handleAxiosError } from '../../util/handleAxiosError';

const getLabelImagesSuccess = (data: LabelImage[]): GetLabelImagesSuccess => ({
  type: GET_LABEL_IMAGE_SUCCESS,
  payload: data,
});

const deleteLabelImageSuccess = (id: number): DeleteLabelImageSuccess => ({
  type: DELETE_LABEL_IMAGE_SUCCESS,
  payload: { id },
});

const requestLabelImagesFailure = (error: any): any => {
  alert(error);
  return { type: REQUEST_LABEL_IMAGE_FAILURE };
};

export const postLabelImageSuccess = (image: LabelImage): PostLabelImageSuccess => ({
  type: POST_LABEL_IMAGE_SUCCESS,
  payload: image,
});

const updateLabelImageAnnotation = (
  imageId: number,
  labels: any,
  part: { id: number; name: string },
  needJustify,
): UpdateLabelImageAnnotation => ({
  type: UPDATE_LABEL_IMAGE_ANNOTATION,
  payload: { id: imageId, labels, part, hasRelabeled: needJustify },
});

export const removeImagesFromPart = (): RemoveImagesFromPartAction => {
  return {
    type: REMOVE_IMAGES_FROM_PART,
  };
};

const updateRelabelRequest = (): UpdateRelabelRequestAction => ({ type: UPDATE_RELABEL_REQUEST });
const updateRelabelSuccess = (): UpdateRelabelSuccessAction => ({ type: UPDATE_RELABEL_SUCCESS });
const updateRelabelFailed = (): UpdateRelabelFailedAction => ({ type: UPDATE_RELABEL_FAILED });

export const getLabelImages = () => (dispatch): Promise<void> => {
  const imagesAPI = axios('/api/images/');
  const partsAPI = axios('/api/parts/');

  return axios
    .all([imagesAPI, partsAPI])
    .then(
      axios.spread((...res) => {
        const imagesRes = res[0].data;
        const partsRes = res[1].data;

        const imagesWithPartName = imagesRes.map((img) => ({
          ...img,
          part: {
            id: img.part,
            name: partsRes.find((e) => e.id === img.part).name,
          },
        }));

        dispatch(getLabelImagesSuccess(imagesWithPartName));
        return void 0;
      }),
    )
    .catch((err) => {
      dispatch(requestLabelImagesFailure(err));
    });
};

export const postLabelImage = (newImage: LabelImage | FormData) => (dispatch): Promise<void> => {
  return axios('/api/images/', {
    method: 'POST',
    data: newImage,
  })
    .then(({ data }) => {
      const newLabelImage: LabelImage = {
        id: data.id,
        image: data.image,
        labels: data.labels,
        part: {
          id: data.part,
          name: '',
        },
        is_relabel: data.is_relabel,
        confidence: data.confidence,
      };
      dispatch(postLabelImageSuccess(newLabelImage));
      return void 0;
    })
    .catch((err) => {
      dispatch(requestLabelImagesFailure(err));
    });
};

export const deleteLabelImage = (id: number) => (dispatch): Promise<void> => {
  return axios(`/api/images/${id}/`, {
    method: 'DELETE',
  })
    .then(() => {
      dispatch(deleteLabelImageSuccess(id));
      return void 0;
    })
    .catch((err) => {
      throw handleAxiosError(err);
    });
};

export const saveLabelImageAnnotation = (imageId: number, hasRelabeled: boolean, isRelabelDone?: boolean) => (
  dispatch,
  getState,
): Promise<void> => {
  const { annotations } = getState().labelingPageState;
  const url = `/api/images/${imageId}/`;
  return axios({
    url,
    method: 'PATCH',
    data: {
      labels: JSON.stringify(annotations.map((e) => e.label)),
      ...(annotations[0] && annotations[0].part.id !== null && { part: annotations[0].part.id }),
    },
  })
    .then(({ data }) => {
      console.info('Save successfully');
      dispatch(
        updateLabelImageAnnotation(
          data.id,
          data.labels,
          {
            // FIXME
            id: annotations[0].part.id ?? data.part,
            name: annotations[0].part.name,
          },
          hasRelabeled,
        ),
      );
      if (isRelabelDone) dispatch(removeImagesFromPart());
      return void 0;
    })
    .catch((err) => {
      dispatch(requestLabelImagesFailure(err));
    });
};

export const thunkUpdateRelabel = () => (dispatch, getState) => {
  dispatch(updateRelabelRequest());

  const data: { partId: number; imageId: number }[] = getState()
    .images.filter((e) => e.is_relabel)
    .map((e) => ({ partId: e.part.id, imageId: e.id }));

  return axios
    .post('/api/relabel/update', data)
    .then(() => {
      dispatch(updateRelabelSuccess());
      return void 0;
    })
    .catch((err) => {
      dispatch(updateRelabelFailed());
      throw handleAxiosError(err);
    });
};

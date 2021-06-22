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
} from './imageTypes';
import { Annotation } from '../labelingPage/labelingPageTypes';

const getLabelImagesSuccess = (data: LabelImage[]): GetLabelImagesSuccess => ({
  type: GET_LABEL_IMAGE_SUCCESS,
  payload: data,
});

const deleteLabelImageSuccess = (id: number): DeleteLabelImageSuccess => ({
  type: DELETE_LABEL_IMAGE_SUCCESS,
  payload: { id },
});

const requestLabelImagesFailure = (error: any): any => {
  console.error(error);
  return { type: REQUEST_LABEL_IMAGE_FAILURE };
};

export const postLabelImageSuccess = (image: LabelImage): PostLabelImageSuccess => ({
  type: POST_LABEL_IMAGE_SUCCESS,
  payload: image,
});

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
      dispatch(postLabelImageSuccess(data));
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
      dispatch(requestLabelImagesFailure(err));
    });
};

export const saveLabelImageAnnotation = (imageId: number, annotations: Annotation[]) => (
  dispatch,
): Promise<void> => {
  const url = `/api/images/${imageId}/`;
  return axios({
    url,
    method: 'PATCH',
    data: {
      labels: JSON.stringify(annotations.map((e) => e.label)),
    },
  })
    .then(({ data }) => {
      console.info('Save successfully');
      dispatch(updateLabelImageAnnotation(data.id, data.labels));
      // dispatch(requestAnnotationsSuccess(annotations));
      return void 0;
    })
    .catch((err) => {
      dispatch(requestLabelImagesFailure(err));
    });
};

export const updateLabelImageAnnotation = (imageId: number, labels: any): UpdateLabelImageAnnotation => ({
  type: UPDATE_LABEL_IMAGE_ANNOTATION,
  payload: { id: imageId, labels },
});

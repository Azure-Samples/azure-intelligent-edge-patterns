import Axios from 'axios';
import * as R from 'ramda';
import { schema, normalize } from 'normalizr';
import uniqid from 'uniqid';

import {
  GET_IMAGES_REQUEST,
  GET_IMAGES_SUCCESS,
  GET_IMAGES_FAILURE,
  CAPTURE_IMAGE_REQUEST,
  CAPTURE_IMAGE_SUCCESS,
  CAPTURE_IMAGE_FAILURE,
} from '../constants';
import { CallAPIAction } from '../../middlewares/callAPIMiddleware';
import { State } from '../../store/State';
import { normalizeImageShape } from '../../reducers/imageReducer';

const normalizeImagesAndLabelByNormalizr = (data) => {
  const image = new schema.Entity('images');
  const labels = new schema.Entity('labels', { image }, { idAttribute: () => uniqid() });
  const imageWithLabel = new schema.Entity(
    'images',
    { image, labels: [labels] },
    {
      processStrategy: normalizeImageShape,
    },
  );

  return normalize(data, [imageWithLabel]);
};

const serializeLabels = R.map<any, any>((e) => ({
  ...e,
  labels: JSON.parse(e.labels),
}));

const normalizeImages = R.compose(normalizeImagesAndLabelByNormalizr, serializeLabels);

export const getImages = (): CallAPIAction<State> => ({
  types: [GET_IMAGES_REQUEST, GET_IMAGES_SUCCESS, GET_IMAGES_FAILURE],
  callAPI: (): Promise<any> => Axios.get(`/api/images/`).then(({ data }) => normalizeImages(data)),
  shouldCallAPI: (state): boolean => state.labelImages.result.length === 0,
});

export const captureImage = (
  streamId: string,
  shouldOpenLabelingPage: boolean,
  imageIds: number[],
): CallAPIAction<State> => ({
  types: [CAPTURE_IMAGE_REQUEST, CAPTURE_IMAGE_SUCCESS, CAPTURE_IMAGE_FAILURE],
  callAPI: (): Promise<void> => Axios.get(`/api/streams/${streamId}/capture`).then(({ data }) => data.image),
  payload: { shouldOpenLabelingPage, imageIds },
});

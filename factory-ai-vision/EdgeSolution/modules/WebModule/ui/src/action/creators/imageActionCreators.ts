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
import { Annotation, AnnotationState } from '../../reducers/labelReducer';

const normalizeImagesAndLabelByNormalizr = (data) => {
  const labels = new schema.Entity('labels', undefined, {
    processStrategy: (value, parent): Annotation => {
      const { id, ...label } = value;
      return {
        id,
        image: parent.id,
        label,
        annotationState: AnnotationState.Finish,
      };
    },
  });

  const images = new schema.Entity(
    'images',
    { labels: [labels] },
    {
      processStrategy: normalizeImageShape,
    },
  );

  return normalize(data, [images]);
};

const serializeLabels = R.map<any, any>((e) => ({
  ...e,
  labels: (JSON.parse(e.labels) || []).map((l) => ({ ...l, id: uniqid() })),
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

import Axios from 'axios';
import {
  GET_IMAGES_REQUEST,
  GET_IMAGES_SUCCESS,
  GET_IMAGES_FAILURE,
  CAPTURE_IMAGE_REQUEST,
  CAPTURE_IMAGE_SUCCESS,
  CAPTURE_IMAGE_FAILURE
} from '../constants';
import { CallAPIAction } from '../../middlewares/callAPIMiddleware';
import { State } from '../../store/State';

export const getImages = (): CallAPIAction<State> => ({
  types: [GET_IMAGES_REQUEST, GET_IMAGES_SUCCESS, GET_IMAGES_FAILURE],
  callAPI: (): Promise<void> =>
    Axios.get(`/api/images/`).then(({ data }) => data),
  shouldCallAPI: (state): boolean => state.parts.result.length === 0,
});

export const captureImage = (streamId: string): CallAPIAction<State> => ({
  types: [CAPTURE_IMAGE_REQUEST, CAPTURE_IMAGE_SUCCESS, CAPTURE_IMAGE_FAILURE],
  callAPI: (): Promise<void> =>
    Axios.get(`/api/streams/${streamId}/capture`).then(({ data }) => data.image),
});

import Axios from 'axios';
import {
  GET_IMAGES_REQUEST,
  GET_IMAGES_SUCCESS,
  GET_IMAGES_FAILURE,
} from '../constants';
import { CallAPIAction } from '../../middlewares/callAPIMiddleware';
import { State } from '../../store/State';

export const getImages = (): CallAPIAction<State> => ({
  types: [GET_IMAGES_REQUEST, GET_IMAGES_SUCCESS, GET_IMAGES_FAILURE],
  callAPI: (): Promise<void> =>
    Axios.get(`/api/images/`).then(({ data }) => data),
  shouldCallAPI: (state): boolean => state.parts.result.length === 0,
});

import axios from 'axios';
import {
  Location,
  DeleteLocationRequest,
  DELETE_LOCATION_REQUEST,
  DeleteLocationSuccess,
  DELETE_LOCATION_SUCCESS,
  DeleteLocationFaliure,
  DELETE_LOCATION_FAILURE,
  GET_LOCATION_REQUEST,
  GET_LOCATION_SUCCESS,
  GET_LOCATION_FAILURE,
  POST_LOCATION_REQUEST,
  POST_LOCATION_SUCCESS,
  POST_LOCATION_FAILURE,
} from './locationTypes';
import { handleAxiosError } from '../../util/handleAxiosError';
import { CallAPIAction } from '../../middlewares/callAPIMiddleware';
import { State } from '../State';

const deleteLocationRequest = (): DeleteLocationRequest => ({
  type: DELETE_LOCATION_REQUEST,
});

const deleteLocationSuccess = (id: number): DeleteLocationSuccess => ({
  type: DELETE_LOCATION_SUCCESS,
  payload: { id },
});

const deleteLocationFailure = (): DeleteLocationFaliure => ({
  type: DELETE_LOCATION_FAILURE,
});

export const getLocations = (): CallAPIAction<State> => ({
  types: [GET_LOCATION_REQUEST, GET_LOCATION_SUCCESS, GET_LOCATION_FAILURE],
  callAPI: (): Promise<void> => axios.get('/api/locations/').then(({ data }) => data),
  shouldCallAPI: (state): boolean => state.locations.length === 0,
});

export const postLocation = (newLocation: Location): CallAPIAction<State> => ({
  types: [POST_LOCATION_REQUEST, POST_LOCATION_SUCCESS, POST_LOCATION_FAILURE],
  callAPI: (): Promise<void> => axios.post('/api/locations/', newLocation).then(({ data }) => data),
});

export const deleteLocation = (locationId: number) => (dispatch): Promise<void> => {
  dispatch(deleteLocationRequest());

  return axios
    .delete(`/api/locations/${locationId}/`)
    .then(() => {
      dispatch(deleteLocationSuccess(locationId));
      return void 0;
    })
    .catch((e) => {
      throw handleAxiosError(e);
    });
};

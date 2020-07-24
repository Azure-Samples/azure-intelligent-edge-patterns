import axios from 'axios';
import {
  GET_LOCATION_SUCCESS,
  POST_LOCATION_SUCCESS,
  REQUEST_LOCATION_FAILURE,
  RequestLocationsFailure,
  PostLocationSuccess,
  Location,
  DeleteLocationRequest,
  DELETE_LOCATION_REQUEST,
  DeleteLocationSuccess,
  DELETE_LOCATION_SUCCESS,
  DeleteLocationFaliure,
  DELETE_LOCATION_FAILURE,
  GET_LOCATION_FAILED,
  GET_LOCATION_REQUEST,
} from './locationTypes';
import { handleAxiosError } from '../../util/handleAxiosError';
import { CallAPIAction } from '../../middlewares/callAPIMiddleware';
import { State } from '../State';

const requestLocationsFailure = (error: any): RequestLocationsFailure => {
  console.error(error);
  alert(error);
  return { type: REQUEST_LOCATION_FAILURE };
};

const postLocationSuccess = (data: Location): PostLocationSuccess => ({
  type: POST_LOCATION_SUCCESS,
  payload: data,
});

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
  types: [GET_LOCATION_REQUEST, GET_LOCATION_SUCCESS, GET_LOCATION_FAILED],
  callAPI: (): Promise<void> => axios.get('/api/locations/').then(({ data }) => data),
  shouldCallAPI: (state): boolean => state.locations.length === 0,
});

export const postLocation = (newLocation: Location) => (dispatch): Promise<void> => {
  return axios('/api/locations/', {
    method: 'POST',
    data: newLocation,
  })
    .then(({ data }) => {
      dispatch(postLocationSuccess(data));
      return void 0;
    })
    .catch((err) => {
      dispatch(requestLocationsFailure(err));
    });
};

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

import axios from 'axios';
import {
  GET_LOCATION_SUCCESS,
  POST_LOCATION_SUCCESS,
  REQUEST_LOCATION_FAILURE,
  GetLocationsSuccess,
  RequestLocationsFailure,
  PostLocationSuccess,
  Location,
} from './locationTypes';

const getLocationsSuccess = (data: Location[]): GetLocationsSuccess => ({
  type: GET_LOCATION_SUCCESS,
  payload: data,
});

const requestLocationsFailure = (error: any): RequestLocationsFailure => {
  console.error(error);
  alert(error);
  return { type: REQUEST_LOCATION_FAILURE };
};

const postLocationSuccess = (data: Location): PostLocationSuccess => ({
  type: POST_LOCATION_SUCCESS,
  payload: data,
});

export const getLocations = () => (dispatch): Promise<void> => {
  return axios('/api/locations/')
    .then(({ data }) => {
      dispatch(getLocationsSuccess(data));
      return void 0;
    })
    .catch((err) => {
      dispatch(requestLocationsFailure(err));
    });
};

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

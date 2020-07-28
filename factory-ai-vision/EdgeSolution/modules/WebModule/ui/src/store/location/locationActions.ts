import axios from 'axios';
import {
  Location,
  DELETE_LOCATION_REQUEST,
  DELETE_LOCATION_SUCCESS,
  DELETE_LOCATION_FAILURE,
  GET_LOCATION_REQUEST,
  GET_LOCATION_SUCCESS,
  GET_LOCATION_FAILURE,
  POST_LOCATION_REQUEST,
  POST_LOCATION_SUCCESS,
  POST_LOCATION_FAILURE,
} from './locationTypes';
import { CallAPIAction } from '../../middlewares/callAPIMiddleware';
import { State } from '../State';

export const getLocations = (isDemo: boolean): CallAPIAction<State> => ({
  types: [GET_LOCATION_REQUEST, GET_LOCATION_SUCCESS, GET_LOCATION_FAILURE],
  callAPI: (): Promise<void> =>
    axios.get(`/api/locations?is_demo=${Number(isDemo)}`).then(({ data }) => data),
  shouldCallAPI: (state): boolean => state.locations.result.length === 0,
});

export const postLocation = (newLocation: Location): CallAPIAction<State> => ({
  types: [POST_LOCATION_REQUEST, POST_LOCATION_SUCCESS, POST_LOCATION_FAILURE],
  callAPI: (): Promise<void> => axios.post('/api/locations/', newLocation).then(({ data }) => data),
});

export const deleteLocation = (id: number): CallAPIAction<State, { id: number }> => ({
  types: [DELETE_LOCATION_REQUEST, DELETE_LOCATION_SUCCESS, DELETE_LOCATION_FAILURE],
  callAPI: (): Promise<void> => axios.delete(`/api/locations/${id}`).then(({ data }) => data),
  payload: { id },
});

import axios from 'axios';
import {
  DELETE_PART_REQUEST,
  DELETE_PART_SUCCESS,
  DELETE_PART_FAILURE,
  GET_PARTS_REQUEST,
  GET_PARTS_SUCCESS,
  GET_PARTS_FAILURE,
  POST_PART_REQUEST,
  POST_PART_SUCCESS,
  POST_PART_FAILURE,
  PUT_PART_REQUEST,
  PUT_PART_SUCCESS,
  PUT_PART_FAILURE,
} from '../constants';
import { CallAPIAction } from '../../middlewares/callAPIMiddleware';
import { State } from '../../store/State';

export const getParts = (isDemo: boolean): CallAPIAction<State> => ({
  types: [GET_PARTS_REQUEST, GET_PARTS_SUCCESS, GET_PARTS_FAILURE],
  callAPI: (): Promise<void> =>
    axios.get(`/api/parts?is_demo=${Number(isDemo)}`).then(({ data }) => data),
  shouldCallAPI: (state): boolean => state.parts.result.length === 0,
});

export const postPart = (newPart: {
  name: string;
  description: string;
  is_demo: boolean;
}): CallAPIAction<State> => ({
  types: [POST_PART_REQUEST, POST_PART_SUCCESS, POST_PART_FAILURE],
  callAPI: (): Promise<void> => axios.post('/api/parts/', newPart).then(({ data }) => data),
});

export const putPart = (updatePart: {
  name: string;
  description: string;
  is_demo: boolean;
}, id: number): CallAPIAction<State> => ({
  types: [PUT_PART_REQUEST, PUT_PART_SUCCESS, PUT_PART_FAILURE],
  callAPI: (): Promise<void> => axios.put(`/api/parts/${id}/`, updatePart).then(({ data }) => data),
  payload: {id}
});

export const deletePart = (id: number): CallAPIAction<State, { id: number }> => ({
  types: [DELETE_PART_REQUEST, DELETE_PART_SUCCESS, DELETE_PART_FAILURE],
  callAPI: (): Promise<void> => axios.delete(`/api/parts/${id}`).then(({ data }) => data),
  payload: { id },
});

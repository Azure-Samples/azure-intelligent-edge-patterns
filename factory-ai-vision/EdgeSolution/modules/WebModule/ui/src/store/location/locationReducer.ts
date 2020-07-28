import * as R from 'ramda';
import {
  GET_LOCATION_SUCCESS,
  POST_LOCATION_SUCCESS,
  DELETE_LOCATION_SUCCESS,
  LocationAction,
  NormalizedLocation,
} from './locationTypes';
import { initialState } from '../State';

const normalizeLocation = (response): NormalizedLocation =>
  response.reduce(
    (acc, cur) => {
      acc.entities[cur.id] = cur;
      acc.result.push(cur.id);
      return acc;
    },
    { entities: {}, result: [] },
  );

const locationsReducer = (state = initialState.locations, action: LocationAction): NormalizedLocation => {
  switch (action.type) {
    case GET_LOCATION_SUCCESS:
      return normalizeLocation(action.response);
    case POST_LOCATION_SUCCESS:
      return {
        entities: {
          ...state.entities,
          [action.response.id]: action.response,
        },
        result: [...state.result, action.response.id],
      };
    case DELETE_LOCATION_SUCCESS: {
      const deleteObj = {
        entities: R.omit([action.id.toString()]),
        result: R.without([action.id]),
      };
      return R.evolve(deleteObj, state);
    }
    default:
      return state;
  }
};

export default locationsReducer;

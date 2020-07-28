import * as R from 'ramda';
import { GET_LOCATION_SUCCESS, POST_LOCATION_SUCCESS, DELETE_LOCATION_SUCCESS } from '../action/constants';
import { ActionTypes } from '../action';
import { initialState } from '../store/State';
import { NormalizedLocation } from './type';

const normalizeLocation = (response): NormalizedLocation =>
  response.reduce(
    (acc, cur) => {
      acc.entities[cur.id] = cur;
      acc.result.push(cur.id);
      return acc;
    },
    { entities: {}, result: [] },
  );

const locationsReducer = (state = initialState.locations, action: ActionTypes): NormalizedLocation => {
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

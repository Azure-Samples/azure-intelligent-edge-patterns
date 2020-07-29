import * as R from 'ramda';
import { GET_PARTS_SUCCESS, POST_PART_SUCCESS, DELETE_PART_SUCCESS, PUT_PART_SUCCESS } from '../action/constants';
import { ActionTypes } from '../action';
import { changeArrayToMap, removeStateById } from './util';
import { NormalizedState } from './type';

export type Part = {
  id: number;
  name: string;
  description: string;
}

export type NormalizedPart = NormalizedState<Part>;

const initialParts: NormalizedPart = {
  entities: {},
  result: []
}

const normalizePartShape = (response: any): Part => ({
  id: response.id,
  name: response.name,
  description: response.description
});

const normalizePart = R.compose(changeArrayToMap, R.map(normalizePartShape));

const partsReducer = (state = initialParts, action: ActionTypes): NormalizedPart => {
  switch (action.type) {
    case GET_PARTS_SUCCESS:
      return normalizePart(action.response);
    case POST_PART_SUCCESS:
      return {
        entities: {
          ...state.entities,
          [action.response.id]: action.response,
        },
        result: [...state.result, action.response.id],
      };
    case PUT_PART_SUCCESS:
      return R.assocPath(['entities', action.id], normalizePartShape(action.response), state);
    case DELETE_PART_SUCCESS: {
      return removeStateById(action.id, state);
    }
    default:
      return state;
  }
};

export default partsReducer;

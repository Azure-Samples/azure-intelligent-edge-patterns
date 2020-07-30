import { ActionTypes, GET_IMAGES_SUCCESS } from '../action';
import { NormalizedState } from '../reducers/type';

export type BoxLabel = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type NormalizedLabel = NormalizedState<BoxLabel, string>;

const initialLabel = { entities: {}, result: [] };

const labelReducer = (state = initialLabel, action: ActionTypes): NormalizedLabel => {
  switch (action.type) {
    case GET_IMAGES_SUCCESS: {
      const { labels } = action.response.entities;
      return {
        entities: labels || {},
        result: labels ? Object.keys(labels) : [],
      };
    }
    default:
      return state;
  }
};

export default labelReducer;

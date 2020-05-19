import {
  GET_LOCATION_SUCCESS,
  REQUEST_LOCATION_FAILURE,
  POST_LOCATION_SUCCESS,
  Location,
  LocationAction,
} from './locationTypes';
import { initialState } from '../State';

const locationsReducer = (state = initialState.locations, action: LocationAction): Location[] => {
  switch (action.type) {
    case GET_LOCATION_SUCCESS:
      return action.payload;
    case REQUEST_LOCATION_FAILURE:
      return state;
    case POST_LOCATION_SUCCESS:
      return state.concat(action.payload);
    default:
      return state;
  }
};

export default locationsReducer;

import {
  GET_LOCATION_SUCCESS,
  REQUEST_LOCATION_FAILURE,
  POST_LOCATION_SUCCESS,
  DELETE_LOCATION_SUCCESS,
  Location,
  LocationAction,
} from './locationTypes';
import { initialState } from '../State';

const locationsReducer = (state = initialState.locations, action: LocationAction): Location[] => {
  switch (action.type) {
    case GET_LOCATION_SUCCESS:
      return action.response;
    case REQUEST_LOCATION_FAILURE:
      return state;
    case POST_LOCATION_SUCCESS:
      return [...state, action.response];
    case DELETE_LOCATION_SUCCESS:
      return state.filter((e) => e.id !== action.payload.id);
    default:
      return state;
  }
};

export default locationsReducer;

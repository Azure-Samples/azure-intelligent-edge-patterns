import { APIRequestAction, APISuccessAction, APIFailureAction } from '../../middlewares/callAPIMiddleware';

// Describing the shape of the loaction's slice of state
export type Location = {
  id?: number;
  name: string;
  description: string;
  projectId?: number;
  is_demo: boolean;
};

// Describing the different ACTION NAMES available
export const GET_LOCATION_REQUEST = 'GET_LOCATION_REQUEST';
export const GET_LOCATION_SUCCESS = 'GET_LOCATION_SUCCESS';
export const GET_LOCATION_FAILURE = 'GET_LOCATION_FAILURE';
export const POST_LOCATION_REQUEST = 'POST_LOCATION_REQUEST';
export const POST_LOCATION_SUCCESS = 'POST_LOCATION_SUCCESS';
export const POST_LOCATION_FAILURE = 'POST_LOCATION_FAILURE';
export const DELETE_LOCATION_REQUEST = 'DELETE_LOCATION_REQUEST';
export const DELETE_LOCATION_SUCCESS = 'DELETE_LOCATION_SUCCESS';
export const DELETE_LOCATION_FAILURE = 'DELETE_LOCATION_FAILURE';

export type GetLocationRequest = APIRequestAction<typeof GET_LOCATION_REQUEST>;
export type GetLocationSuccess = APISuccessAction<typeof GET_LOCATION_SUCCESS>;
export type GetLocationFailure = APIFailureAction<typeof GET_LOCATION_FAILURE>;

export type PostLocationRequest = APIRequestAction<typeof POST_LOCATION_REQUEST>;
export type PostLocationSuccess = APISuccessAction<typeof POST_LOCATION_SUCCESS>;
export type PostLocationFailure = APIFailureAction<typeof POST_LOCATION_FAILURE>;

export type DeleteLocationRequest = APIRequestAction<typeof DELETE_LOCATION_REQUEST>;
export type DeleteLocationSuccess = APISuccessAction<typeof DELETE_LOCATION_SUCCESS, null, { id: number }>;
export type DeleteLocationFaliure = APIFailureAction<typeof DELETE_LOCATION_FAILURE>;

export type LocationAction =
  | GetLocationRequest
  | GetLocationFailure
  | GetLocationSuccess
  | PostLocationRequest
  | PostLocationSuccess
  | PostLocationFailure
  | PostLocationSuccess
  | DeleteLocationRequest
  | DeleteLocationSuccess
  | DeleteLocationFaliure;

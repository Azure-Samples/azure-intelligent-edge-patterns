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
export const REQUEST_LOCATION_FAILURE = 'REQUEST_LOCATION_FAILURE';
export const POST_LOCATION_REQUEST = 'POST_LOCATION_REQUEST';
export const POST_LOCATION_SUCCESS = 'POST_LOCATION_SUCCESS';
export const POST_LOCATION_FAILURE = 'POST_LOCATION_FAILURE';
export const DELETE_LOCATION_REQUEST = 'DELETE_LOCATION_REQUEST';
export const DELETE_LOCATION_FAILURE = 'DELETE_LOCATION_FAILURE';
export const DELETE_LOCATION_SUCCESS = 'DELETE_LOCATION_SUCCESS';

export type GetLocationRequest = APIRequestAction<typeof GET_LOCATION_REQUEST>;
export type GetLocationSuccess = APISuccessAction<typeof GET_LOCATION_SUCCESS>;
export type GetLocationFailed = APIFailureAction<typeof GET_LOCATION_FAILURE>;

export type PostLocationRequest = APIRequestAction<typeof POST_LOCATION_REQUEST>;
export type PostLocationSuccess = APISuccessAction<typeof POST_LOCATION_SUCCESS>;
export type PostLocationFalure = APIFailureAction<typeof POST_LOCATION_FAILURE>;

export type RequestLocationsFailure = { type: typeof REQUEST_LOCATION_FAILURE };
export type DeleteLocationRequest = { type: typeof DELETE_LOCATION_REQUEST };
export type DeleteLocationSuccess = { type: typeof DELETE_LOCATION_SUCCESS; payload: { id: number } };
export type DeleteLocationFaliure = { type: typeof DELETE_LOCATION_FAILURE };

export type LocationAction =
  | GetLocationRequest
  | GetLocationFailed
  | GetLocationSuccess
  | PostLocationRequest
  | PostLocationSuccess
  | PostLocationFalure
  | RequestLocationsFailure
  | PostLocationSuccess
  | DeleteLocationRequest
  | DeleteLocationSuccess
  | DeleteLocationFaliure;

// Describing the shape of the loaction's slice of state
export type Location = {
  locationName: string;
  coordinates: string;
  description: string;
};

// Describing the different ACTION NAMES available
export const GET_LOCATION_SUCCESS = 'GET_LOCATION_SUCCESS';
export const REQUEST_LOCATION_FAILURE = 'REQUEST_LOCATION_FAILURE';
export const POST_LOCATION_SUCCESS = 'POST_LOCATION_SUCCESS';

export type GetLocationsSuccess = { type: typeof GET_LOCATION_SUCCESS; payload: Location[] };
export type RequestLocationsFailure = { type: typeof REQUEST_LOCATION_FAILURE };
export type PostLocationSuccess = { type: typeof POST_LOCATION_SUCCESS; payload: Location };

export type LocationAction = GetLocationsSuccess | RequestLocationsFailure | PostLocationSuccess;

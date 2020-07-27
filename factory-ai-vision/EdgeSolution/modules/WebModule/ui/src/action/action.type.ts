/**
 * Define the shape of actions here
 * TODO: Move all the action type here
 */
import * as constants from './constants';
import { APIRequestAction, APISuccessAction, APIFailureAction } from '../middlewares/callAPIMiddleware';

export type GetLocationRequest = APIRequestAction<typeof constants.GET_NOTIFICATIONS_REQUEST>;
export type GetLocationSuccess = APISuccessAction<typeof constants.GET_NOTIFICATIONS_SUCCESS>;
export type GetLocationFailure = APIFailureAction<typeof constants.GET_NOTIFICATIONS_FAILURE>;

export type ActionTypes = GetLocationRequest | GetLocationSuccess | GetLocationFailure;

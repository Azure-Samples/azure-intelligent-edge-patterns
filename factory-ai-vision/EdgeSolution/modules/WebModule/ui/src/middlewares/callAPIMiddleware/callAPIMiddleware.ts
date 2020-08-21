/* eslint-disable prefer-object-spread */
import { Middleware, AnyAction } from 'redux';
import { CallAPIAction } from './callAPIMiddleware.type';

export const callAPIMiddleware: Middleware = ({ dispatch, getState }) => (next) => (
  action: CallAPIAction | AnyAction,
): AnyAction => {
  const { types, callAPI, shouldCallAPI = (): boolean => true, payload = {} } = action;

  if (!types) {
    // Normal action: pass it on
    return next(action as AnyAction);
  }

  if (!Array.isArray(types) || types.length !== 3 || !types.every((type) => typeof type === 'string')) {
    throw new Error('Expected an array of three string types.');
  }

  if (typeof callAPI !== 'function') {
    throw new Error('Expected callAPI to be a function.');
  }

  if (!shouldCallAPI(getState())) {
    return;
  }

  const [requestType, successType, failureType] = types;

  dispatch(
    Object.assign({}, payload, {
      type: requestType,
    }),
  );

  return callAPI(getState()).then(
    (response) =>
      dispatch(
        Object.assign({}, payload, {
          response,
          type: successType,
        }),
      ),
    (error) =>
      dispatch(
        Object.assign({}, payload, {
          error,
          type: failureType,
        }),
      ),
  );
};

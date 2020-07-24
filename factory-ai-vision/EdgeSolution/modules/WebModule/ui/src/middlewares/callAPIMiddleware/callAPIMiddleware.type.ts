/* eslint-disable @typescript-eslint/no-explicit-any */
export type CallAPIAction<S = any> = {
  types: string[];
  callAPI: () => Promise<any>;
  shouldCallAPI?: (state: S) => boolean;
  payload?: Record<any, any>;
};

export type APIRequestAction<T> = {
  type: T;
};

export type APISuccessAction<T, R = any> = {
  type: T;
  response: R;
};

export type APIFailureAction<T> = {
  type: T;
  error: Error;
};

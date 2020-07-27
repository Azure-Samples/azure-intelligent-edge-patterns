/* eslint-disable @typescript-eslint/no-explicit-any */
export type CallAPIAction<S = any, P = any> = {
  types: string[];
  callAPI: () => Promise<any>;
  shouldCallAPI?: (state: S) => boolean;
  payload?: P;
};

export type APIRequestAction<T, P = {}> = P & {
  type: T;
};

export type APISuccessAction<T, R = any, P = {}> = P & {
  type: T;
  response: R;
};

export type APIFailureAction<T, P = {}> = P & {
  type: T;
  error: Error;
};

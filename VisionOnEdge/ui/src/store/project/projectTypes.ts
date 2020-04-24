import { ThunkAction } from 'redux-thunk';
import { Action } from 'redux';

export type Project = {
  id: number;
  camera: any;
  location: any;
  parts: any[];
  modelUrl: string;
};

// Describing the different ACTION NAMES available
export const GET_PROJECT_SUCCESS = 'GET_PROJECT_SUCCESS';
export type GetProjectSuccessAction = {
  type: typeof GET_PROJECT_SUCCESS;
  payload: {
    project: Project;
  };
};

export const GET_PROJECT_FAILED = 'GET_PROJECT_FAILED';
export type GetProjectFailedAction = {
  type: typeof GET_PROJECT_FAILED;
};

export const POST_PROJECT_SUCCESS = 'POST_PROJECT_SUCCESS';
export type PostProjectSuccessAction = {
  type: typeof POST_PROJECT_SUCCESS;
};

export const POST_PROJECT_FALIED = 'POST_PROJECT_FALIED';
export type PostProjectFaliedAction = {
  type: typeof POST_PROJECT_FALIED;
};

export const DELETE_PROJECT_SUCCESS = 'DELETE_PROJECT_SUCCESS';
export type DeleteProjectSuccessAction = {
  type: typeof DELETE_PROJECT_SUCCESS;
};

export const DELETE_PROJECT_FALIED = 'DELETE_PROJECT_FALIED';
export type DeleteProjectFaliedAction = {
  type: typeof DELETE_PROJECT_FALIED;
};

export type ProjectActionTypes =
  | GetProjectSuccessAction
  | GetProjectFailedAction
  | PostProjectSuccessAction
  | PostProjectFaliedAction
  | DeleteProjectSuccessAction
  | DeleteProjectFaliedAction;

// Describing the different THUNK ACTION NAMES available
export type ProjectThunk<ReturnType = void> = ThunkAction<ReturnType, Project, unknown, Action<string>>;

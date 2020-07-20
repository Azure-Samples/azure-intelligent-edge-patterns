import { ThunkAction } from 'redux-thunk';
import { Action } from 'redux';
import type { State } from '../State';

type SettingData = {
  id: number;
  key: string;
  namespace: string;
};

export type Setting = {
  loading: boolean;
  error: Error;
  current: SettingData;
  origin: SettingData;
  isTrainerValid: boolean;
  cvProjects?: Record<string, string>;
  appInsightHasInit: boolean;
};

export type UpdateKeyAction = {
  type: 'UPDATE_KEY';
  payload: string;
};

export type UpdateNamespaceAction = {
  type: 'UPDATE_NAMESPACE';
  payload: string;
};

export type GetSettingRequestAction = {
  type: 'REQUEST_START';
};

export type GetSettingSuccessAction = {
  type: 'REQUEST_SUCCESS';
  payload: Setting;
};

export type GetSettingFailedAction = {
  type: 'REQUEST_FAIL';
  error: Error;
};

export type GetAllCvProjectsRequestAction = {
  type: 'GET_ALL_CV_PROJECTS_REQUEST';
};

export type GetAllCvProjectsSuccessAction = {
  type: 'GET_ALL_CV_PROJECTS_SUCCESS';
  pyload: Record<string, string>;
};

export type GetAllCvProjectsErrorAction = {
  type: 'GET_ALL_CV_PROJECTS_ERROR';
  error: Error;
};

export type SettingActionType =
  | UpdateKeyAction
  | UpdateNamespaceAction
  | GetSettingRequestAction
  | GetSettingSuccessAction
  | GetSettingFailedAction
  | GetAllCvProjectsRequestAction
  | GetAllCvProjectsSuccessAction
  | GetAllCvProjectsErrorAction;

export type SettingThunk<ReturnType = void> = ThunkAction<ReturnType, State, unknown, Action<string>>;

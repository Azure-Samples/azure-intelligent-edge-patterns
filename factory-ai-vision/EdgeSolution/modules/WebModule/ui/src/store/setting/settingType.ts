import { ThunkAction } from 'redux-thunk';
import { Action } from 'redux';
import type { State } from 'RootStateType';

export type CVProject = { id: string; name: string, exportable: boolean };

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
  // If the given endpoint and key is valid
  isTrainerValid: boolean;
  cvProjects: CVProject[];
  appInsightHasInit: boolean;
  isCollectData: boolean;
  appInsightKey?: string;
};

export type UpdateKeyAction = {
  type: 'UPDATE_KEY';
  payload: string;
};

export type UpdateNamespaceAction = {
  type: 'UPDATE_NAMESPACE';
  payload: string;
};

export type OnSettingStatusCheckAction = {
  type: 'ON_SETTING_STATUS_CHECK';
  payload: {
    appInsightHasInit: boolean;
    isTrainerValid: boolean;
  };
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
  type: 'settings/listAllProjects/pending';
};

export type GetAllCvProjectsSuccessAction = {
  type: 'settings/listAllProjects/fulfilled';
  pyload: CVProject[];
};

export type GetAllCvProjectsErrorAction = {
  type: 'settings/listAllProjects/rejected';
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
  | GetAllCvProjectsErrorAction
  | OnSettingStatusCheckAction;

export type SettingThunk<ReturnType = void> = ThunkAction<ReturnType, State, unknown, Action<string>>;

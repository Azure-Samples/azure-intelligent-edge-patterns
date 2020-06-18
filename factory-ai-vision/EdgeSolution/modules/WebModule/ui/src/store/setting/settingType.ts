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

export type SettingActionType =
  | UpdateKeyAction
  | UpdateNamespaceAction
  | GetSettingRequestAction
  | GetSettingSuccessAction
  | GetSettingFailedAction;

export type SettingThunk<ReturnType = void> = ThunkAction<ReturnType, State, unknown, Action<string>>;

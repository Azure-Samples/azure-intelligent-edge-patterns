import Axios, { AxiosRequestConfig } from 'axios';

import {
  UpdateKeyAction,
  UpdateNamespaceAction,
  GetSettingRequestAction,
  GetSettingSuccessAction,
  Setting,
  GetSettingFailedAction,
  SettingThunk,
} from './settingType';

export const updateKey = (key: string): UpdateKeyAction => ({ type: 'UPDATE_KEY', payload: key });

export const updateNamespace = (namespace: string): UpdateNamespaceAction => ({
  type: 'UPDATE_NAMESPACE',
  payload: namespace,
});

export const settingRequest = (): GetSettingRequestAction => ({
  type: 'REQUEST_START',
});

export const settingSuccess = (data: Setting): GetSettingSuccessAction => ({
  type: 'REQUEST_SUCCESS',
  payload: data,
});

export const settingFailed = (error: Error): GetSettingFailedAction => ({
  type: 'REQUEST_FAIL',
  error,
});

export const thunkGetSetting = () => (dispatch): Promise<any> => {
  dispatch(settingRequest());

  return Axios.get('/api/settings/')
    .then(({ data }) => {
      if (data.length > 0) {
        dispatch(
          settingSuccess({
            loading: false,
            error: null,
            current: {
              id: data[0].id,
              key: data[0].training_key,
              namespace: data[0].endpoint,
            },
            origin: {
              id: data[0].id,
              key: data[0].training_key,
              namespace: data[0].endpoint,
            },
            isTrainerValid: data[0].is_trainer_valid,
          }),
        );
      }
      return data[0].is_collect_data;
    })
    .catch((err) => {
      dispatch(settingFailed(err));
    });
};

export const thunkPostSetting = (): SettingThunk => (dispatch, getStore): Promise<any> => {
  const settingData = getStore().setting.current;
  const isSettingEmpty = settingData.id === -1;
  const url = isSettingEmpty ? `/api/settings/` : `/api/settings/${settingData.id}/`;
  const requestConfig: AxiosRequestConfig = isSettingEmpty
    ? {
        data: {
          training_key: settingData.key,
          endpoint: settingData.namespace,
          name: '',
          iot_hub_connection_string: '',
          device_id: '',
          module_id: '',
        },
        method: 'POST',
      }
    : {
        data: {
          training_key: settingData.key,
          endpoint: settingData.namespace,
        },
        method: 'PUT',
      };

  dispatch(settingRequest());

  return Axios(url, requestConfig)
    .then(({ data }) => {
      dispatch(
        settingSuccess({
          loading: false,
          error: null,
          current: {
            id: data.id,
            key: data.training_key,
            namespace: data.endpoint,
          },
          origin: {
            id: data.id,
            key: data.training_key,
            namespace: data.endpoint,
          },
          isTrainerValid: data.is_trainer_valid,
        }),
      );
      return void 0;
    })
    .catch((err) => {
      dispatch(settingFailed(err));
    });
};

import Axios, { AxiosRequestConfig } from 'axios';

import {
  UpdateKeyAction,
  UpdateNamespaceAction,
  GetSettingRequestAction,
  GetSettingSuccessAction,
  Setting,
  GetSettingFailedAction,
  SettingThunk,
  GetAllCvProjectsRequestAction,
  GetAllCvProjectsSuccessAction,
  GetAllCvProjectsErrorAction,
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

const getAllCvProjectsRequest = (): GetAllCvProjectsRequestAction => ({
  type: 'GET_ALL_CV_PROJECTS_REQUEST',
});

const getAllCvProjectsSuccess = (cvProjects: Record<string, string>): GetAllCvProjectsSuccessAction => ({
  type: 'GET_ALL_CV_PROJECTS_SUCCESS',
  pyload: cvProjects,
});

const getAllCvProjectError = (error: Error): GetAllCvProjectsErrorAction => ({
  type: 'GET_ALL_CV_PROJECTS_ERROR',
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
            appInsightHasInit: data[0].app_insight_has_init,
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
          appInsightHasInit: data.app_insight_has_init,
        }),
      );
      return void 0;
    })
    .catch((err) => {
      dispatch(settingFailed(err));
    });
};

export const thunkGetAllCvProjects = (): SettingThunk => (dispatch, getState) => {
  dispatch(getAllCvProjectsRequest());

  const settingId = getState().setting.current.id;
  return Axios.get(`/api/settings/${settingId}/list_projects`)
    .then(({ data }) => {
      dispatch(getAllCvProjectsSuccess(data));
      return void 0;
    })
    .catch((e) => {
      if (e.response) {
        throw new Error(e.response.data.log);
      } else if (e.request) {
        throw new Error(e.request);
      } else {
        throw e;
      }
    })
    .catch((e) => {
      dispatch(getAllCvProjectError(e));
    });
};

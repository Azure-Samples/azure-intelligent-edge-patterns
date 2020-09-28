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
  OnSettingStatusCheckAction,
  CVProject,
} from './settingType';
import { getTrainingProject } from '../trainingProjectSlice';
import { getAppInsights } from '../../TelemetryService';
import { createWrappedAsync } from '../shared/createWrappedAsync';

export const updateKey = (key: string): UpdateKeyAction => ({ type: 'UPDATE_KEY', payload: key });

export const updateNamespace = (namespace: string): UpdateNamespaceAction => ({
  type: 'UPDATE_NAMESPACE',
  payload: namespace,
});

export const onSettingStatusCheck = (
  isTrainerValid: boolean,
  appInsightHasInit: boolean,
): OnSettingStatusCheckAction => ({
  type: 'ON_SETTING_STATUS_CHECK',
  payload: {
    isTrainerValid,
    appInsightHasInit,
  },
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
  type: 'settings/listAllProjects/pending',
});

const getAllCvProjectsSuccess = (cvProjects: CVProject[]): GetAllCvProjectsSuccessAction => ({
  type: 'settings/listAllProjects/fulfilled',
  pyload: cvProjects,
});

export const getAllCvProjectError = (error: Error): GetAllCvProjectsErrorAction => ({
  type: 'settings/listAllProjects/rejected',
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
            isCollectData: data[0].is_collect_data,
            cvProjects: [],
          }),
        );
      }

      // Set the state to localstorage so next time don't need to get them from server
      window.localStorage.setItem('isTrainerValid', JSON.stringify(data[0].is_trainer_valid));
      window.localStorage.setItem('appInsightHasInit', JSON.stringify(data[0].app_insight_has_init));

      return data[0].is_collect_data;
    })
    .catch((err) => {
      dispatch(settingFailed(err));
    });
};

export const thunkGetSettingAndAppInsightKey = (): SettingThunk => (dispatch): Promise<void> => {
  dispatch(settingRequest());

  const appInsightKey = Axios.get('/api/appinsight/key');
  const settings = Axios.get('/api/settings/');

  return Axios.all([appInsightKey, settings])
    .then(
      Axios.spread((...responses) => {
        const { data: appInsightKeyData } = responses[0];
        const { data: settingsData } = responses[1];

        if (appInsightKeyData.key) {
          dispatch(
            settingSuccess({
              loading: false,
              error: null,
              current: {
                id: settingsData[0].id,
                key: settingsData[0].training_key,
                namespace: settingsData[0].endpoint,
              },
              origin: {
                id: settingsData[0].id,
                key: settingsData[0].training_key,
                namespace: settingsData[0].endpoint,
              },
              isTrainerValid: settingsData[0].is_trainer_valid,
              appInsightHasInit: settingsData[0].app_insight_has_init,
              isCollectData: settingsData[0].is_collect_data,
              appInsightKey: appInsightKeyData.key,
              cvProjects: [],
            }),
          );
        } else {
          throw new Error('No API Key');
        }
      }),
    )
    .catch((e) => console.error(e));
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
          isCollectData: data.is_collect_data,
          cvProjects: [],
        }),
      );
      dispatch(thunkGetAllCvProjects());
      dispatch(getTrainingProject(false));
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
      dispatch(getAllCvProjectsSuccess(data?.projects || []));
      return void 0;
    })
    .catch((e) => {
      if (e.response) {
        throw new Error(e.response.data.error.message);
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

export const checkSettingStatus = (): SettingThunk => async (dispatch): Promise<void> => {
  const isTrainerValidStr = await window.localStorage.getItem('isTrainerValid');
  const isTrainerValid = isTrainerValidStr ? JSON.parse(isTrainerValidStr) : false;
  const appInsightHasInitStr = await window.localStorage.getItem('isTrainerValid');
  const appInsightHasInit = appInsightHasInitStr ? JSON.parse(appInsightHasInitStr) : false;
  dispatch(onSettingStatusCheck(isTrainerValid, appInsightHasInit));
};

export const patchIsCollectData = createWrappedAsync<
  any,
  { id: number; isCollectData: boolean; hasInit: boolean }
>('settings/updateIsCollectData', async ({ id, isCollectData, hasInit }) => {
  await Axios.patch(`/api/settings/${id}`, {
    is_collect_data: isCollectData,
    ...(hasInit && { app_insight_has_init: hasInit }),
  });
  const appInsight = getAppInsights();
  if (!appInsight) throw Error('App Insight hasnot been initialize');
  appInsight.config.disableTelemetry = !isCollectData;
});

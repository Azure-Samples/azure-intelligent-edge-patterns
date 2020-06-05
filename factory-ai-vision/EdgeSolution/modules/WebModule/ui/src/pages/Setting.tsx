import React, { useState, useEffect, useReducer, Reducer, useContext } from 'react';
import * as R from 'ramda';
import {
  Divider,
  Flex,
  Text,
  Input,
  Button,
  Alert,
  Dropdown,
  DropdownItemProps,
  Checkbox,
} from '@fluentui/react-northstar';
import { Link } from 'react-router-dom';
import Axios, { AxiosRequestConfig } from 'axios';
import { useProject } from '../hooks/useProject';
import { useAppInsight } from '../components/TelemetryProvider';

const initialState = {
  loading: false,
  error: null,
  current: {
    id: -1,
    key: '',
    namespace: '',
  },
  origin: {
    id: -1,
    key: '',
    namespace: '',
  },
};

type SettingDataState = typeof initialState;

type Action =
  | {
      type: 'UPDATE_KEY';
      payload: string;
    }
  | {
      type: 'UPDATE_NAMESPACE';
      payload: string;
    }
  | {
      type: 'REQUEST_START';
    }
  | {
      type: 'REQUEST_SUCCESS';
      payload: SettingDataState;
    }
  | {
      type: 'REQUEST_FAIL';
      error: Error;
    };

type SettingReducer = Reducer<SettingDataState, Action>;

const reducer: SettingReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_KEY':
      return { ...state, current: { ...state.current, key: action.payload } };
    case 'UPDATE_NAMESPACE':
      return { ...state, current: { ...state.current, namespace: action.payload } };
    case 'REQUEST_START':
      return { ...state, loading: true };
    case 'REQUEST_SUCCESS':
      return action.payload;
    case 'REQUEST_FAIL':
      return { ...state, error: action.error };
    default:
      return state;
  }
};

export const Setting = (): JSX.Element => {
  const [{ loading, error, current: settingData, origin: originSettingData }, dispatch] = useReducer<
    SettingReducer
  >(reducer, initialState);
  const [checkboxChecked, setCheckboxChecked] = useState(false);

  const notEmpty = settingData.id !== -1;

  const cannotUpdateOrSave = R.equals(settingData, originSettingData);

  useEffect(() => {
    dispatch({ type: 'REQUEST_START' });

    Axios.get('/api/settings/')
      .then(({ data }) => {
        if (data.length > 0) {
          dispatch({
            type: 'REQUEST_SUCCESS',
            payload: {
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
            },
          });
          setCheckboxChecked(data[0].is_collect_data);
        }
        return void 0;
      })
      .catch((err) => {
        dispatch({ type: 'REQUEST_FAIL', error: err });
      });
  }, []);

  const appInsight = useAppInsight();
  useEffect(() => {
    if (appInsight) appInsight.config.disableTelemetry = !checkboxChecked;
  }, [appInsight, checkboxChecked]);

  const onSave = (): void => {
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

    dispatch({ type: 'REQUEST_START' });

    Axios(url, requestConfig)
      .then(({ data }) => {
        dispatch({
          type: 'REQUEST_SUCCESS',
          payload: {
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
          },
        });
        // Reload page so PreviousProjectPanel can query again
        window.location.reload();
        return void 0;
      })
      .catch((err) => {
        dispatch({ type: 'REQUEST_FAIL', error: err });
      });
  };

  const onCheckBoxClick = (): void => {
    const newCheckboxChecked = !checkboxChecked;
    setCheckboxChecked(newCheckboxChecked);
    Axios.patch(`/api/settings/${settingData.id}`, { is_collect_data: newCheckboxChecked }).catch((err) => {
      setCheckboxChecked(checkboxChecked);
      console.error(err);
    });
  };

  return (
    <>
      <h1>Setting</h1>
      <Divider color="grey" design={{ paddingBottom: '10px' }} />
      <Flex gap="gap.large" design={{ height: '80%' }}>
        <Flex column gap="gap.large" design={{ width: '50%' }}>
          <Text size="large" weight="bold">
            Azure Cognitive Services Settings:{' '}
          </Text>
          <Flex vAlign="center">
            <Text size="large" design={{ width: '300px' }}>
              Namespace:
            </Text>
            <Input
              value={settingData.namespace}
              onChange={(_, { value }): void => dispatch({ type: 'UPDATE_NAMESPACE', payload: value })}
              fluid
            />
          </Flex>
          <Flex vAlign="center">
            <Text size="large" design={{ width: '300px' }}>
              Key:
            </Text>
            <Input
              value={settingData.key}
              onChange={(_, { value }): void => dispatch({ type: 'UPDATE_KEY', payload: value })}
              fluid
            />
          </Flex>
          <Flex gap="gap.large">
            <Button primary onClick={onSave} disabled={cannotUpdateOrSave || loading} loading={loading}>
              {notEmpty ? 'Update' : 'Save'}
            </Button>
            <Button primary as={Link} to="/">
              Cancel
            </Button>
          </Flex>
          {error ? <Alert danger content={`Failed to save ${error}`} dismissible /> : null}
        </Flex>
        {notEmpty && <PreviousProjectPanel settingDataId={settingData.id} />}
      </Flex>
      <Divider color="grey" />
      <Checkbox
        label="Allow to Send Usage Data"
        toggle
        checked={checkboxChecked}
        onChange={onCheckBoxClick}
      />
    </>
  );
};

const PreviousProjectPanel: React.FC<{ settingDataId: number }> = ({ settingDataId }) => {
  const [dropdownItems, setDropdownItems] = useState<DropdownItemProps[]>([]);
  const [customVisionProjectId, setCustomVisionProjectId] = useState('');
  const { isLoading: isProjectLoading, error: projectError, data: projectData } = useProject();
  const [otherLoading, setOtherLoading] = useState(false);
  const [otherError, setOtherError] = useState<Error>(null);

  const onDropdownChange = (_, data): void => {
    if (data.value === null) setCustomVisionProjectId(customVisionProjectId);
    else setCustomVisionProjectId(data.value.content.key);
  };

  const onLoad = (): void => {
    setOtherLoading(true);
    Axios.get(
      `api/projects/${projectData.id}/pull_cv_project?customvision_project_id=${customVisionProjectId}`,
    )
      .catch((err) => setOtherError(err))
      .finally(() => setOtherLoading(false));
  };

  useEffect(() => {
    if (settingDataId !== -1) {
      setOtherLoading(true);
      Axios.get(`/api/settings/${settingDataId}/list_projects`)
        .then(({ data }) => {
          const items: DropdownItemProps[] = Object.entries(data).map(([key, value]) => ({
            header: value,
            content: {
              key,
            },
          }));
          setDropdownItems(items);
          return void 0;
        })
        .catch((e) => setOtherError(e))
        .finally(() => setOtherLoading(false));
    }
  }, [settingDataId]);

  const loading = otherLoading || isProjectLoading;
  const error = [otherError, projectError].filter((e) => !!e);

  return (
    <>
      <Divider color="grey" vertical styles={{ height: '100%' }} />
      <Flex column gap="gap.large">
        <Text size="large" weight="bold">
          Previous Projects:{' '}
        </Text>
        <Dropdown items={dropdownItems} onChange={onDropdownChange} />
        <Button
          primary
          content="Load"
          disabled={!customVisionProjectId || loading}
          onClick={onLoad}
          loading={loading}
        />
        {error.length ? <Alert danger content={`Failed to load ${error.join(', ')}`} dismissible /> : null}
      </Flex>
    </>
  );
};

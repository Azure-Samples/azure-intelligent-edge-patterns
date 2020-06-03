import React, { useState, useEffect, useReducer, Reducer } from 'react';
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
} from '@fluentui/react-northstar';
import { Link } from 'react-router-dom';
import Axios, { AxiosRequestConfig } from 'axios';
import { useProject } from '../hooks/useProject';

const initialState = {
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
      type: 'UPDATE_ALL';
      payload: SettingDataState;
    };

type SettingReducer = Reducer<SettingDataState, Action>;

const reducer: SettingReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_KEY':
      return { ...state, current: { ...state.current, key: action.payload } };
    case 'UPDATE_NAMESPACE':
      return { ...state, current: { ...state.current, namespace: action.payload } };
    case 'UPDATE_ALL':
      return action.payload;
    default:
      return state;
  }
};

export const Setting = (): JSX.Element => {
  const [saveStatus, setSaveStatus] = useState({
    success: false,
    content: '',
  });
  const [{ current: settingData, origin: originSettingData }, dispatch] = useReducer<SettingReducer>(
    reducer,
    initialState,
  );

  const notEmpty = settingData.id !== -1;

  const cannotUpdateOrSave = R.equals(settingData, originSettingData);

  useEffect(() => {
    Axios.get('/api/settings/')
      .then(({ data }) => {
        if (data.length > 0) {
          dispatch({
            type: 'UPDATE_ALL',
            payload: {
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
        }
        return void 0;
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

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

    Axios(url, requestConfig)
      .then(({ data }) => {
        setSaveStatus({ success: true, content: 'Save Setting Successfully' });
        dispatch({
          type: 'UPDATE_ALL',
          payload: {
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
        return void 0;
      })
      .catch((err) => {
        setSaveStatus({ success: false, content: `Fail to save settings: /n ${err.toString()}` });
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
            <Button primary onClick={onSave} disabled={cannotUpdateOrSave}>
              {notEmpty ? 'Update' : 'Save'}
            </Button>
            <Button primary as={Link} to="/">
              Cancel
            </Button>
          </Flex>
          {saveStatus.content ? (
            <Alert
              success={saveStatus.success}
              danger={!saveStatus.success}
              content={saveStatus.content}
              dismissible
            />
          ) : null}
        </Flex>
        {notEmpty && <PreviousProjectPanel settingDataId={settingData.id} />}
      </Flex>
    </>
  );
};

const PreviousProjectPanel: React.FC<{ settingDataId: number }> = ({ settingDataId }) => {
  const [dropdownItems, setDropdownItems] = useState<DropdownItemProps[]>([]);
  const [customVisionProjectId, setCustomVisionProjectId] = useState('');
  const { isLoading: isProjectLoading, error: projectError, data: projectData } = useProject();

  const onDropdownChange = (_, data): void => {
    if (data.value === null) setCustomVisionProjectId(customVisionProjectId);
    else setCustomVisionProjectId(data.value.content.key);
  };

  const onLoad = (): void => {
    Axios.get(
      `api/projects/${projectData.id}/pull_cv_project?customvision_project_id=${customVisionProjectId}`,
    )
      .then(({ data }) => console.log(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    if (settingDataId !== -1) {
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
        .catch((e) => {
          console.error(e);
        });
    }
  }, [settingDataId]);

  return (
    <>
      <Divider color="grey" vertical styles={{ height: '100%' }} />
      <Flex column gap="gap.large">
        <Text size="large" weight="bold">
          Previous Projects:{' '}
        </Text>
        <Dropdown items={dropdownItems} onChange={onDropdownChange} />
        <Button primary content="Load" disabled={!customVisionProjectId} onClick={onLoad} />
      </Flex>
    </>
  );
};

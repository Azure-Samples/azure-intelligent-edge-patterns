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
  Checkbox,
  Dialog,
  QuestionCircleIcon,
  Tooltip,
} from '@fluentui/react-northstar';
import { Link } from 'react-router-dom';
import Axios, { AxiosRequestConfig } from 'axios';
import { useProject } from '../hooks/useProject';
import { getAppInsights } from '../TelemetryService';
import { WarningDialog } from '../components/WarningDialog';

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
  const [isUserGuideOpen, setIsUserGuideOpen] = useState(false);

  const notEmpty = originSettingData.namespace && originSettingData.key;

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
    Axios.patch(`/api/settings/${settingData.id}`, { is_collect_data: newCheckboxChecked })
      .then(() => {
        const appInsight = getAppInsights();
        if (!appInsight) throw Error('App Insight hasnot been initialize');
        appInsight.config.disableTelemetry = !newCheckboxChecked;
        return void 0;
      })
      .catch((err) => {
        setCheckboxChecked(checkboxChecked);
        alert(err);
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
              Endpoint:
            </Text>
            <Input
              value={settingData.namespace}
              onChange={(_, { value }): void => dispatch({ type: 'UPDATE_NAMESPACE', payload: value })}
              fluid
            />
            <Tooltip
              trigger={
                <Button
                  text
                  icon={<QuestionCircleIcon />}
                  iconOnly
                  onClick={(): void => setIsUserGuideOpen(true)}
                />
              }
              content="Where to get Endpoint and Key?"
            />
            <Dialog
              open={isUserGuideOpen}
              header="Get Endpoint and Key"
              content={
                <Flex column styles={{ maxHeight: '800px', overflow: 'scroll' }}>
                  <p>
                    Step 1: Login Custom vision,{' '}
                    <a href="https://www.customvision.ai/" target="_blank" rel="noopener noreferrer">
                      https://www.customvision.ai/
                    </a>
                  </p>
                  <p>Step 2: Click on the setting icon on the top</p>
                  <img src="guide_step_2.png" style={{ width: '100%' }} />
                  <p>
                    Step 3: Choose the resources under the account, you will see information of
                    &quot;Key&quot; and &quot;Endpoint&quot;
                  </p>
                  <img src="guide_step_3.png" style={{ width: '100%' }} />
                </Flex>
              }
              confirmButton="Close"
              onConfirm={(): void => setIsUserGuideOpen(false)}
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
            <WarningDialog
              onConfirm={onSave}
              trigger={
                <Button primary disabled={cannotUpdateOrSave || loading} loading={loading}>
                  {notEmpty ? 'Update' : 'Save'}
                </Button>
              }
              contentText={<p>Update Key / Namespace will remove all the parts, sure you want to update?</p>}
            />
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

const initialDropdownItem = [
  {
    header: '+ Create New Project',
    content: {
      key: 'NEW',
    },
  },
];

const PreviousProjectPanel: React.FC<{ settingDataId: number }> = ({ settingDataId }) => {
  const [dropdownItems, setDropdownItems] = useState<DropdownItemProps[]>(initialDropdownItem);
  const [customVisionProjectId, setCustomVisionProjectId] = useState('');
  const { isLoading: isProjectLoading, error: projectError, data: projectData } = useProject(false);
  const [loadFullImages, setLoadFullImages] = useState(false);
  const [otherLoading, setOtherLoading] = useState(false);
  const [otherError, setOtherError] = useState<Error>(null);
  const [createProjectModel, setCreateProjectModel] = useState(false);

  const onDropdownChange = (_, data): void => {
    if (data.value === null) setCustomVisionProjectId(customVisionProjectId);
    else if (data.value.content.key === initialDropdownItem[0].content.key) setCreateProjectModel(true);
    else setCustomVisionProjectId(data.value.content.key);
  };

  const onLoad = (): void => {
    setOtherLoading(true);
    Axios.get(
      `/api/projects/${
        projectData.id
      }/pull_cv_project?customvision_project_id=${customVisionProjectId}&partial=${Number(!loadFullImages)}`,
    )
      .catch((err) => setOtherError(err))
      .finally(() => setOtherLoading(false));
  };

  const onCreateNewProject = (): void => {
    setOtherLoading(true);
    Axios.get(`/api/projects/${projectData.id}/reset_project`)
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
          setDropdownItems([...initialDropdownItem, ...items]);
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
        {loadFullImages ? (
          <Checkbox
            checked={loadFullImages}
            label="Load Full Images"
            onClick={(): void => setLoadFullImages((prev) => !prev)}
          />
        ) : (
          <WarningDialog
            contentText={<p>Depends on the number of images, loading full images takes time</p>}
            onConfirm={(): void => setLoadFullImages((prev) => !prev)}
            trigger={<Checkbox checked={loadFullImages} label="Load Full Images" />}
          />
        )}
        <WarningDialog
          contentText={<p>Load Project will remove all the parts, sure you want to do that?</p>}
          onConfirm={onLoad}
          trigger={
            <Button primary content="Load" disabled={!customVisionProjectId || loading} loading={loading} />
          }
        />
        <WarningDialog
          contentText={<p>Create New Project will remove all the parts, sure you want to do that?</p>}
          open={createProjectModel}
          onConfirm={() => {
            onCreateNewProject();
            setCreateProjectModel(false);
          }}
          onCancel={() => {
            setCreateProjectModel(false);
            setCustomVisionProjectId(null);
          }}
        />
        {error.length ? <Alert danger content={`Failed to load ${error.join(', ')}`} dismissible /> : null}
      </Flex>
    </>
  );
};

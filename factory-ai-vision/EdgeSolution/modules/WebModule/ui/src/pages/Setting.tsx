import React, { useState, useEffect } from 'react';
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
  QuestionCircleIcon,
  Tooltip,
} from '@fluentui/react-northstar';
import { Link } from 'react-router-dom';
import Axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';

import { useProject } from '../hooks/useProject';
import { getAppInsights } from '../TelemetryService';
import { WarningDialog } from '../components/WarningDialog';
import { State } from '../store/State';
import { Setting as SettingType } from '../store/setting/settingType';
import {
  updateNamespace,
  updateKey,
  thunkGetSetting,
  thunkPostSetting,
  thunkGetAllCvProjects,
} from '../store/setting/settingAction';
import { updateProjectData, updateOriginProjectData, thunkGetProject } from '../store/project/projectActions';
import { Dialog } from '../components/Dialog';

export const Setting = (): JSX.Element => {
  const {
    loading,
    error,
    current: settingData,
    origin: originSettingData,
    isTrainerValid,
    cvProjects,
    appInsightHasInit,
  } = useSelector<State, SettingType>((state) => state.setting);
  const dispatch = useDispatch();
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [isUserGuideOpen, setIsUserGuideOpen] = useState(false);
  const [otherError, setOtherError] = useState<Error>(null);

  const notEmpty = originSettingData.namespace && originSettingData.key;

  const cannotUpdateOrSave = R.equals(settingData, originSettingData);

  useEffect(() => {
    (dispatch(thunkGetSetting()) as any)
      .then((isCollectData: boolean) => setCheckboxChecked(isCollectData))
      .catch((e) => console.error(e));
  }, [dispatch]);

  const onSave = (): void => {
    (dispatch(thunkPostSetting()) as any)
      .then(() => {
        // Reload page so PreviousProjectPanel can query again
        window.location.reload();
        return void 0;
      })
      .catch((e) => console.error(e));
  };

  const updateIsCollectData = (isCollectData, hasInit?): void => {
    Axios.patch(`/api/settings/${settingData.id}`, {
      is_collect_data: isCollectData,
      ...(hasInit && { app_insight_has_init: hasInit }),
    })
      .then(() => {
        const appInsight = getAppInsights();
        if (!appInsight) throw Error('App Insight hasnot been initialize');
        appInsight.config.disableTelemetry = !isCollectData;
        // FIXME
        window.location.reload();
        return void 0;
      })
      .catch((err) => {
        setCheckboxChecked(checkboxChecked);
        setOtherError(err);
      });
  };

  const onCheckBoxClick = (): void => {
    const newCheckboxChecked = !checkboxChecked;
    setCheckboxChecked(newCheckboxChecked);
    updateIsCollectData(newCheckboxChecked);
  };

  useEffect(() => {
    if (settingData.id !== -1) {
      dispatch(thunkGetAllCvProjects());
    }
  }, [dispatch, settingData.id]);

  return (
    <>
      <h1>Setting</h1>
      <Divider color="grey" design={{ paddingBottom: '10px' }} />
      <Flex gap="gap.large" design={{ height: '80%' }}>
        <Flex column gap="gap.large" design={{ width: '50%' }}>
          <Text size="large" weight="bold">
            Azure Cognitive Services Settings:
          </Text>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '100px auto 50px',
              gridTemplateRows: 'auto auto',
              rowGap: '30px',
            }}
          >
            <Text size="large">Endpoint:</Text>
            <Input
              value={settingData.namespace}
              onChange={(_, { value }): void => {
                dispatch(updateNamespace(value));
              }}
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
                  <img src="/icons/guide_step_2.png" style={{ width: '100%' }} />
                  <p>
                    Step 3: Choose the resources under the account, you will see information of
                    &quot;Key&quot; and &quot;Endpoint&quot;
                  </p>
                  <img src="/icons/guide_step_3.png" style={{ width: '100%' }} />
                </Flex>
              }
              confirmButton="Close"
              onConfirm={(): void => setIsUserGuideOpen(false)}
            />
            <Text size="large">Key:</Text>
            <Input
              value={settingData.key}
              onChange={(_, { value }): void => {
                dispatch(updateKey(value));
              }}
              fluid
            />
          </div>
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
            <Button primary as={Link} to={isTrainerValid ? '/' : 'setting'}>
              Cancel
            </Button>
          </Flex>
          {error ? <Alert danger content={`${error.message}`} dismissible /> : null}
          {otherError ? <Alert danger content={`${otherError.message}`} dismissible /> : null}
        </Flex>
        {isTrainerValid && <PreviousProjectPanel cvProjects={cvProjects} />}
      </Flex>
      <Divider color="grey" />
      <Checkbox
        label="Allow to Send Usage Data"
        toggle
        checked={checkboxChecked}
        onChange={onCheckBoxClick}
      />
      <WarningDialog
        contentText={
          <>
            <h1 style={{ textAlign: 'center' }}>Data Collection Policy</h1>
            <p>
              The software may collect information about your use of the software and send it to Microsoft.
              Microsoft may use this information to provide services and improve our products and services.
              You may turn off the telemetry as described in the repository or clicking settings on top right
              corner. Our privacy statement is located at{' '}
              <a href="https://go.microsoft.com/fwlink/?LinkID=824704">
                https://go.microsoft.com/fwlink/?LinkID=824704
              </a>
              . You can learn more about data collection and use in the help documentation and our privacy
              statement. Your use of the software operates as your consent to these practices.
            </p>
          </>
        }
        open={!appInsightHasInit}
        confirmButton="I agree"
        cancelButton="I don't agree"
        onConfirm={(): void => updateIsCollectData(true, true)}
        onCancel={(): void => updateIsCollectData(false, true)}
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

const PreviousProjectPanel: React.FC<{ cvProjects: Record<string, string> }> = ({ cvProjects = {} }) => {
  const { isLoading: isProjectLoading, error: projectError, data: projectData, originData } = useProject(
    false,
  );
  const [loadFullImages, setLoadFullImages] = useState(false);
  const [otherLoading, setOtherLoading] = useState(false);
  const [otherError, setOtherError] = useState<Error>(null);
  const [createProjectModel, setCreateProjectModel] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [successDialog, setSuccessDialog] = useState('');
  const dispatch = useDispatch();

  const onDropdownChange = (_, data): void => {
    if (data.value === null) dispatch(updateProjectData({ cvProjectId: projectData.cvProjectId }, false));
    else if (data.value.content.key === initialDropdownItem[0].content.key) setCreateProjectModel(true);
    else dispatch(updateProjectData({ cvProjectId: data.value.content.key }, false));
  };

  const onLoad = (): void => {
    setOtherLoading(true);
    Axios.get(
      `/api/projects/${projectData.id}/pull_cv_project?customvision_project_id=${
        projectData.cvProjectId
      }&partial=${Number(!loadFullImages)}`,
    )
      .then(() => {
        dispatch(updateOriginProjectData(false));
        setSuccessDialog('Load Project Success');
        return void 0;
      })
      .catch((err) => setOtherError(err))
      .finally(() => setOtherLoading(false));
  };

  const onCreateNewProject = async (): Promise<void> => {
    setOtherLoading(true);
    try {
      await Axios.get(`/api/projects/${projectData.id}/reset_project?project_name=${projectName}`);
      // Update cvProject when create success
      dispatch(thunkGetProject(false));
      dispatch(thunkGetAllCvProjects());
      setSuccessDialog('Create Project Success');
    } catch (err) {
      setOtherError(err);
    }
    setOtherLoading(false);
  };

  useEffect(() => {
    let didCancel = false;
    if (successDialog) {
      setTimeout(() => {
        if (!didCancel) setSuccessDialog('');
      }, 3000);
    }

    return (): void => {
      didCancel = true;
    };
  });

  const dropdownItems: DropdownItemProps[] = [
    ...initialDropdownItem,
    ...Object.entries(cvProjects).map(([key, value]) => ({
      header: value,
      content: {
        key,
      },
    })),
  ];

  const loading = otherLoading || isProjectLoading;
  const error = [otherError, projectError].filter((e) => !!e);

  const selectedDropdownItems = dropdownItems.find((e) => (e.content as any).key === projectData.cvProjectId);

  return (
    <>
      <Divider color="grey" vertical styles={{ height: '100%' }} />
      <Flex column gap="gap.large">
        <Text size="large" weight="bold">
          Projects:{' '}
        </Text>
        <Dropdown items={dropdownItems} onChange={onDropdownChange} value={selectedDropdownItems} />
        {loadFullImages && projectData.cvProjectId !== 'NEW' && (
          <Checkbox
            checked={loadFullImages}
            label="Load Full Images"
            onClick={(): void => setLoadFullImages((prev) => !prev)}
          />
        )}
        {!loadFullImages && projectData.cvProjectId !== 'NEW' && (
          <WarningDialog
            contentText={<p>Depends on the number of images, loading full images takes time</p>}
            onConfirm={(): void => setLoadFullImages((prev) => !prev)}
            trigger={<Checkbox checked={loadFullImages} label="Load Full Images" />}
          />
        )}
        {projectData.cvProjectId === 'NEW' && (
          <Input
            placeholder="Input a project name"
            fluid
            onChange={(_, { value }): void => {
              setProjectName(value);
            }}
          />
        )}
        {projectData.cvProjectId === 'NEW' ? (
          <Button
            primary
            content={'Create'}
            disabled={loading}
            loading={loading}
            onClick={onCreateNewProject}
          />
        ) : (
          <WarningDialog
            contentText={<p>Load Project will remove all the parts, sure you want to do that?</p>}
            onConfirm={onLoad}
            trigger={
              <Button
                primary
                content={'Load'}
                disabled={(!loadFullImages && projectData.cvProjectId === originData.cvProjectId) || loading}
                loading={loading}
              />
            }
          />
        )}
        <WarningDialog
          contentText={<p>Create New Project will remove all the parts, sure you want to do that?</p>}
          open={createProjectModel}
          onConfirm={(): void => {
            setCreateProjectModel(false);
            dispatch(updateProjectData({ ...projectData, cvProjectId: 'NEW' }, false));
          }}
          onCancel={(): void => setCreateProjectModel(false)}
        />
        {error.length ? <Alert danger content={`Failed to load ${error.join(', ')}`} dismissible /> : null}
        {successDialog && <Alert dismissible header={successDialog} success visible />}
      </Flex>
    </>
  );
};

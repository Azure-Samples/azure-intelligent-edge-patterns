import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import * as R from 'ramda';
import {
  Panel,
  Stack,
  PrimaryButton,
  DefaultButton,
  Dropdown,
  TextField,
  PanelType,
  getTheme,
  Pivot,
  PivotItem,
  IDropdownOption,
  DropdownMenuItemType,
} from '@fluentui/react';
import { useSelector, useDispatch } from 'react-redux';
import Axios from 'axios';
import { isBefore, isSameDay, isAfter } from 'date-fns';

import { getCameras, cameraOptionsSelectorFactoryInConfig } from '../../store/cameraSlice';
import { partOptionsSelectorFactory, getParts } from '../../store/partSlice';
import { ProjectData, DeploymentType } from '../../store/project/projectTypes';
import {
  getTrainingProject,
  TrainingProject,
  trainingProjectOptionsSelectorFactory,
} from '../../store/trainingProjectSlice';
import { getAppInsights } from '../../TelemetryService';
import { getConfigure, thunkPostProject } from '../../store/project/projectActions';
import { getScenario } from '../../store/scenarioSlice';
import { OnChangeType } from './type';
import { Url } from '../../constant';
import { getCascades, selectAllCascades } from '../../store/cascadeSlice';

import { extractRecommendFps } from '../../utils/projectUtils';

import { AdvancedOptions } from './AdvancedOptions';

const sendTrainInfoToAppInsight = async (selectedParts: ProjectData['parts']): Promise<void> => {
  const { data: images } = await Axios.get('/api/images/');

  const interestedImagesLength = images.filter((e) => selectedParts.includes(e.part)).length;
  const appInsight = getAppInsights();
  if (appInsight)
    appInsight.trackEvent({
      name: 'train',
      properties: {
        images: interestedImagesLength,
        parts: selectedParts.length,
        source: '',
      },
    });
};

const { palette } = getTheme();

const panelStyles = {
  root: {
    height: 'calc(100% - 48px)',
    top: '46px',
  },
  main: {
    backgroundColor: palette.neutralLighter,
  },
  footerInner: {
    backgroundColor: palette.neutralLighter,
  },
};

const useProjectData = (initialProjectData: ProjectData): [ProjectData, OnChangeType] => {
  const [projectData, setProjectData] = useState(initialProjectData);

  useEffect(() => {
    setProjectData(initialProjectData);
  }, [initialProjectData]);

  const onChange: OnChangeType = useCallback(
    (key, value, optional) => {
      const cloneProject = R.clone(projectData);
      cloneProject[key] = value;

      if (key === 'trainingProject') {
        // New Feature: want to select other Model, old camera still in option.
        // It's no flexible, need to refactor.
        const newCameras = [...cloneProject.oldCameras, ...cloneProject.cameras].reduce((prev, cur) => {
          if (prev.length === 0) return [cur];
          if (prev.find((p) => p !== cur)) return [...prev, cur];
          return prev;
        }, []);
        cloneProject.oldCameras = newCameras;
        cloneProject.deployment_type = optional.type as DeploymentType;

        console.log('optional.type', optional.type);
        if ((optional.type as DeploymentType) === 'cascade') {
          cloneProject.cascade = optional.value;
        }

        // Because demo parts and demo camera can only be used in demo training project(6 scenarios)
        // We should reset them every time the training project is changed
        cloneProject.cameras = [];
        cloneProject.parts = [];
      } else if (key === 'cameras') {
        cloneProject.SVTCcameras = cloneProject.SVTCcameras.filter((e) => cloneProject.cameras.includes(e));

        cloneProject.recomendedFps = extractRecommendFps(
          cloneProject.totalRecomendedFps,
          cloneProject.cameras.length || 1,
        );
      } else if (key === 'parts') {
        cloneProject.SVTCparts = cloneProject.SVTCparts.filter((e) => cloneProject.parts.includes(e));
      } else if (key === 'SVTCisOpen' && !value) {
        cloneProject.SVTCcameras = [];
        cloneProject.SVTCconfirmationThreshold = 0;
        cloneProject.SVTCparts = [];
      } else if (key === 'countingStartTime' && value !== 'Invalid Date') {
        // If the selected date is later than the end date, set both as the select date
        if (isAfter(new Date(value as string), new Date(cloneProject.countingEndTime))) {
          cloneProject.countingEndTime = value as string;
        }

        if (isSameDay(new Date(value as string), new Date())) {
          cloneProject.countingStartTime = new Date().toString();
        }

        if (
          isSameDay(new Date(value as string), new Date()) &&
          isAfter(new Date(value as string), new Date(cloneProject.countingEndTime))
        ) {
          cloneProject.countingStartTime = new Date().toString();
        }

        if (
          isSameDay(new Date(cloneProject.countingEndTime), new Date(value as string)) &&
          isBefore(new Date(value as string), new Date(cloneProject.countingEndTime))
        ) {
          cloneProject.countingStartTime = value as string;
        }
      } else if (key === 'countingEndTime' && value !== 'Invalid Date') {
        // If the selected date is earlier than the start date, set both as the select date
        if (isBefore(new Date(value as string), new Date(cloneProject.countingStartTime))) {
          cloneProject.countingStartTime = value as string;
        }

        if (isSameDay(new Date(value as string), new Date())) {
          cloneProject.countingStartTime = new Date().toString();
          cloneProject.countingEndTime = new Date().toString();
        }

        if (
          isSameDay(new Date(value as string), new Date()) &&
          isAfter(new Date(value as string), new Date(cloneProject.countingStartTime))
        ) {
          cloneProject.countingEndTime = value as string;
        }
      }
      setProjectData(cloneProject);
    },
    [projectData],
  );

  return [projectData, onChange];
};

type ConfigTaskPanelProps = {
  isOpen: boolean;
  onDismiss: () => void;
  projectData: ProjectData;
  trainingProjectOfSelectedScenario?: number;
  isEdit?: boolean;
};

const getEditSelectedProjectKey = (projectData: ProjectData) => {
  if (!projectData.trainingProject) return `cascade_${projectData.cascade}`;
  return projectData.trainingProject;
};

export const ConfigTaskPanel: React.FC<ConfigTaskPanelProps> = ({
  isOpen,
  onDismiss,
  projectData: initialProjectData,
  trainingProjectOfSelectedScenario = null,
  isEdit = false,
}) => {
  const [projectData, onChange] = useProjectData(initialProjectData);

  const cameraOptionsSelectorInConfig = useMemo(
    () => cameraOptionsSelectorFactoryInConfig(projectData.trainingProject, projectData.oldCameras),
    [projectData.trainingProject, projectData.oldCameras],
  );
  const cameraOptions = useSelector(cameraOptionsSelectorInConfig);
  const selectedCameraOptions = useMemo(
    () => cameraOptions.filter((e) => projectData.cameras.includes(e.key)),
    [cameraOptions, projectData.cameras],
  );

  const partOptionsSelector = useMemo(() => partOptionsSelectorFactory(projectData.trainingProject), [
    projectData.trainingProject,
  ]);
  const partOptions = useSelector(partOptionsSelector);
  const selectedPartOptions = useMemo(() => partOptions.filter((e) => projectData.parts.includes(e.key)), [
    partOptions,
    projectData.parts,
  ]);

  const trainingProjectOptionsSelector = trainingProjectOptionsSelectorFactory(
    isEdit ? initialProjectData.trainingProject : trainingProjectOfSelectedScenario,
  );
  console.log('isEdit', isEdit);
  console.log('initialProjectData', initialProjectData);

  const trainingProjectOptions = useSelector(trainingProjectOptionsSelector);
  console.log('trainingProjectOptions', trainingProjectOptions);
  console.log('projectData.trainingProject', projectData);

  const cascadeList = useSelector(selectAllCascades);

  const dispatch = useDispatch();
  const history = useHistory();
  const [deploying, setdeploying] = useState(false);

  const modelOptions: IDropdownOption[] = [
    { key: 'model', text: 'Model', itemType: DropdownMenuItemType.Header },
    ...trainingProjectOptions,
    { key: 'divider_1', text: '-', itemType: DropdownMenuItemType.Divider },
    { key: 'cascade', text: 'Cascade', itemType: DropdownMenuItemType.Header },
    ...cascadeList.map((cascade, id) => ({
      key: `cascade_${cascade.id}`,
      text: cascade.name,
      title: 'cascade',
    })),
  ];

  useEffect(() => {
    dispatch(getParts());
    dispatch(getCameras(true));
    dispatch(getTrainingProject(true));
    dispatch(getScenario());
    dispatch(getCascades());
  }, [dispatch]);

  const onDeployClicked = async () => {
    sendTrainInfoToAppInsight(projectData.parts);

    setdeploying(true);
    const projectId = await dispatch(thunkPostProject(projectData));
    if (typeof projectId === 'number') {
      await dispatch(getConfigure((projectId as unknown) as number));

      onDismiss();
      history.push(Url.DEPLOYMENT);
    }
    setdeploying(false);
  };

  const onRenderFooterContent = () => {
    let deployBtnTxt = 'Deploy';
    if (isEdit) deployBtnTxt = 'Redeploy';
    if (deploying) deployBtnTxt = 'Deploying';
    return (
      <Stack tokens={{ childrenGap: 5 }} horizontal>
        <PrimaryButton text={deployBtnTxt} onClick={onDeployClicked} disabled={deploying} />
        <DefaultButton text="Cancel" onClick={onDismiss} />
      </Stack>
    );
  };

  return (
    <Panel
      isOpen={isOpen}
      onDismiss={onDismiss}
      hasCloseButton
      headerText={isEdit ? 'Edit task' : 'Deploy task'}
      onRenderFooterContent={onRenderFooterContent}
      isFooterAtBottom={true}
      type={PanelType.smallFluid}
      styles={panelStyles}
    >
      <Pivot>
        <PivotItem headerText="Basic">
          <Stack tokens={{ childrenGap: 10 }} styles={{ root: { paddingTop: '30px', width: '300px' } }}>
            <TextField
              required
              value={projectData.name}
              onChange={(_, newValue) => onChange('name', newValue)}
            />
            <Dropdown
              label="Model"
              options={modelOptions}
              required
              selectedKey={isEdit ? getEditSelectedProjectKey(projectData) : projectData.trainingProject}
              onChange={(_, options) => {
                onChange('trainingProject', options.key as number, {
                  type: options.title,
                  value: options.key as string,
                });
              }}
            />
            <Dropdown
              label="Camera"
              multiSelect
              options={cameraOptions}
              required
              selectedKeys={projectData.cameras}
              onChange={(_, option) => {
                onChange(
                  'cameras',
                  option.selected
                    ? [...projectData.cameras, option.key as number]
                    : projectData.cameras.filter((key) => key !== option.key),
                );
              }}
            />
            <Dropdown
              label="Objects"
              multiSelect
              options={partOptions}
              required
              selectedKeys={projectData.parts}
              onChange={(_, option) => {
                if (option) {
                  onChange(
                    'parts',
                    option.selected
                      ? [...projectData.parts, option.key as number]
                      : projectData.parts.filter((key) => key !== option.key),
                  );
                }
              }}
              styles={{ root: { '.is-disabled': { border: '1px solid #605e5c' } } }}
              disabled={projectData.deployment_type === 'cascade'}
            />
          </Stack>
        </PivotItem>
        <PivotItem headerText="Advanced">
          <AdvancedOptions
            projectData={projectData}
            selectedCameraOptions={selectedCameraOptions}
            selectedPartOptions={selectedPartOptions}
            onChange={onChange}
          />
        </PivotItem>
      </Pivot>
    </Panel>
  );
};

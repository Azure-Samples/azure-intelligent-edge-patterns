import React, { useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import * as R from 'ramda';
import {
  Panel,
  Stack,
  PrimaryButton,
  DefaultButton,
  Dropdown,
  Text,
  TextField,
  Toggle,
  PanelType,
  getTheme,
  Label,
  mergeStyleSets,
  MaskedTextField,
} from '@fluentui/react';
import { useSelector, useDispatch } from 'react-redux';
import Axios from 'axios';

import { State } from 'RootStateType';
import { getCameras, cameraOptionsSelectorInConfig } from '../store/cameraSlice';
import { partOptionsSelector, getParts } from '../store/partSlice';
import {
  ProjectData,
  InferenceMode,
  InferenceProtocol,
  InferenceSource,
} from '../store/project/projectTypes';
import { getTrainingProject, trainingProjectOptionsSelector } from '../store/trainingProjectSlice';
import { getAppInsights } from '../TelemetryService';
import { thunkPostProject } from '../store/project/projectActions';
import { ExpandPanel } from './ExpandPanel';
import { getScenario } from '../store/scenarioSlice';

const sendTrainInfoToAppInsight = async (selectedParts): Promise<void> => {
  const { data: images } = await Axios.get('/api/images/');

  const selectedPartIds = selectedParts.map((e) => e.id);
  const interestedImagesLength = images.filter((e) => selectedPartIds.includes(e.part)).length;
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
const classNames = mergeStyleSets({
  textWrapper: {
    paddingBottom: '16px',
  },
});
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

type ConfigTaskPanelProps = {
  isOpen: boolean;
  onDismiss: () => void;
  projectData: ProjectData;
  trainingProjectOfSelectedScenario?: number;
  isEdit?: boolean;
};

export const ConfigTaskPanel: React.FC<ConfigTaskPanelProps> = ({
  isOpen,
  onDismiss,
  projectData: initialProjectData,
  trainingProjectOfSelectedScenario = null,
  isEdit = false,
}) => {
  const [projectData, setProjectData] = useState(initialProjectData);
  useEffect(() => {
    setProjectData(initialProjectData);
  }, [initialProjectData]);

  const cameraOptions = useSelector(cameraOptionsSelectorInConfig(projectData.trainingProject));
  const selectedCameraOptions = useMemo(
    () => cameraOptions.filter((e) => projectData.cameras.includes(e.key)),
    [cameraOptions, projectData.cameras],
  );
  const partOptions = useSelector(partOptionsSelector(projectData.trainingProject));
  const trainingProjectOptions = useSelector(
    trainingProjectOptionsSelector(
      isEdit ? initialProjectData.trainingProject : trainingProjectOfSelectedScenario,
    ),
  );
  const canSelectProjectRetrain = useSelector((state: State) =>
    state.trainingProject.nonDemo.includes(projectData.trainingProject),
  );
  const scenarios = useSelector((state: State) => state.scenario);
  const dispatch = useDispatch();
  const history = useHistory();

  function onChange<K extends keyof P, P = ProjectData>(key: K, value: P[K]) {
    const cloneProject = R.clone(projectData);
    (cloneProject as any)[key] = value;
    if (key === 'trainingProject') {
      cloneProject.parts = [];
      cloneProject.cameras = [];

      const relatedScenario = scenarios.find((e) => e.trainingProject === cloneProject.trainingProject);
      if (relatedScenario !== undefined) cloneProject.inferenceMode = relatedScenario.inferenceMode;
      else cloneProject.inferenceMode = InferenceMode.PartDetection;
    } else if (key === 'cameras') {
      cloneProject.cameraToBeRecord = cloneProject.cameraToBeRecord.filter((e) =>
        cloneProject.cameras.includes(e),
      );
    } else if (key === 'sendVideoToCloud' && !value) {
      cloneProject.cameraToBeRecord = [];
    }
    setProjectData(cloneProject);
  }

  useEffect(() => {
    dispatch(getParts());
    dispatch(getCameras(true));
    dispatch(getTrainingProject(true));
    dispatch(getScenario());
  }, [dispatch]);

  const onStart = async () => {
    sendTrainInfoToAppInsight(projectData.parts);

    await dispatch(thunkPostProject(projectData));

    onDismiss();
    history.push('/home/deployment');
  };

  const onRenderFooterContent = () => {
    return (
      <Stack tokens={{ childrenGap: 5 }} horizontal>
        <PrimaryButton text={isEdit ? 'Redeploy' : 'Deploy'} onClick={onStart} />
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
      <Stack tokens={{ childrenGap: 10 }} styles={{ root: { width: '300px' } }}>
        <TextField required value={projectData.name} onChange={(_, newValue) => onChange('name', newValue)} />
        <Dropdown
          label="Model"
          options={trainingProjectOptions}
          required
          selectedKey={projectData.trainingProject}
          onChange={(_, options) => {
            onChange('trainingProject', options.key as number);
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
        />
      </Stack>
      <ExpandPanel
        titleHidden="Advanced options"
        titleVisible="Fewer options"
        iconPosition="end"
        bottomBorder
      >
        <Stack horizontal tokens={{ childrenGap: 50 }} wrap styles={{ root: { paddingTop: '30px' } }}>
          <Stack.Item disableShrink>
            <div className={classNames.textWrapper}>
              <Label>Cloud messaging</Label>
              <Text>Send successful inferences to the cloud</Text>
            </div>
            <Toggle
              label="Enable cloud messages"
              checked={projectData.sendMessageToCloud}
              onChange={(_, checked) => {
                onChange('sendMessageToCloud', checked);
              }}
              inlineLabel
            />
            {projectData.sendMessageToCloud && (
              <>
                <TextField
                  label="Frames per minute"
                  type="number"
                  value={projectData.framesPerMin?.toString()}
                  onChange={(_, newValue) => {
                    onChange('framesPerMin', parseInt(newValue, 10));
                  }}
                  disabled={!projectData.sendMessageToCloud}
                  required
                />
              </>
            )}
          </Stack.Item>
          {canSelectProjectRetrain && (
            <Stack.Item disableShrink>
              <div className={classNames.textWrapper}>
                <Label>Retraining image</Label>
                <Text>Save images to tag and improve training model</Text>
              </div>
              <Toggle
                inlineLabel
                label="Enable capturing images"
                checked={projectData.needRetraining}
                onChange={(_, checked) => {
                  onChange('needRetraining', checked);
                }}
              />
              {projectData.needRetraining && (
                <>
                  <Stack horizontal tokens={{ childrenGap: 24 }}>
                    <TextField
                      label="Min"
                      type="number"
                      value={projectData.accuracyRangeMin?.toString()}
                      onChange={(_, newValue) => {
                        onChange('accuracyRangeMin', parseInt(newValue, 10));
                      }}
                      suffix="%"
                      disabled={!projectData.needRetraining}
                    />
                    <TextField
                      label="Max"
                      type="number"
                      value={projectData.accuracyRangeMax?.toString()}
                      onChange={(_, newValue) => {
                        onChange('accuracyRangeMax', parseInt(newValue, 10));
                      }}
                      suffix="%"
                      disabled={!projectData.needRetraining}
                    />
                  </Stack>
                  <TextField
                    label="Minimum Images to store"
                    type="number"
                    value={projectData.maxImages?.toString()}
                    onChange={(_, newValue) => {
                      onChange('maxImages', parseInt(newValue, 10));
                    }}
                    disabled={!projectData.needRetraining}
                  />
                </>
              )}
            </Stack.Item>
          )}
          <Stack.Item disableShrink>
            <div className={classNames.textWrapper}>
              <Label>Send video to cloud</Label>
            </div>
            <Toggle
              inlineLabel
              label="Enable sending video"
              checked={projectData.sendVideoToCloud}
              onChange={(_, checked) => {
                onChange('sendVideoToCloud', checked);
              }}
            />
            <Dropdown
              disabled={!projectData.sendVideoToCloud}
              options={selectedCameraOptions}
              multiSelect
              selectedKeys={projectData.cameraToBeRecord}
              onChange={(_, option) => {
                onChange(
                  'cameraToBeRecord',
                  option.selected
                    ? [...projectData.cameraToBeRecord, option.key as number]
                    : projectData.cameraToBeRecord.filter((key) => key !== option.key),
                );
              }}
            />
          </Stack.Item>
          <Stack.Item disableShrink>
            <div className={classNames.textWrapper}>
              <Label>Camera FPS</Label>
            </div>
            <Toggle
              inlineLabel
              label="Enable setting FPS manually"
              checked={projectData.setFpsManually}
              onChange={(_, checked) => {
                onChange('setFpsManually', checked);
              }}
            />
            <MaskedTextField
              value={(projectData.setFpsManually ? projectData.fps : projectData.recomendedFps)?.toString()}
              onChange={(_, val) => onChange('fps', parseInt(val, 10))}
              disabled={!projectData.setFpsManually}
              errorMessage={
                projectData.fps > projectData.recomendedFps && projectData.setFpsManually
                  ? `The recommended value for FPS is '${projectData.recomendedFps}', higher than the recommended value will affect the performance.`
                  : ''
              }
              styles={{ errorMessage: { maxWidth: '200px' } }}
              mask="999 fps"
              maskChar=" "
            />
          </Stack.Item>
          {projectData.inferenceSource === InferenceSource.LVA && (
            <Stack.Item disableShrink>
              <div className={classNames.textWrapper}>
                <Label>Protocol of inference</Label>
              </div>
              <Toggle
                inlineLabel
                label={projectData.inferenceProtocol}
                checked={projectData.inferenceProtocol === InferenceProtocol.GRPC}
                onChange={(_, checked) => {
                  if (checked) onChange('inferenceProtocol', InferenceProtocol.GRPC);
                  else onChange('inferenceProtocol', InferenceProtocol.Http);
                }}
              />
            </Stack.Item>
          )}
        </Stack>
      </ExpandPanel>
    </Panel>
  );
};

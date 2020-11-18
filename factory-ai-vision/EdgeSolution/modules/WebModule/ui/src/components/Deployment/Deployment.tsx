/* eslint react/display-name: "off" */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Stack,
  Text,
  getTheme,
  Separator,
  CommandBar,
  ICommandBarItemProps,
  Pivot,
  PivotItem,
  IDropdownOption,
  Dropdown,
} from '@fluentui/react';
import { useSelector, useDispatch } from 'react-redux';
import { useBoolean } from '@uifabric/react-hooks';
import moment from 'moment';
import * as R from 'ramda';

import { State } from 'RootStateType';
import { InferenceSource, Project, Status } from '../../store/project/projectTypes';
import {
  thunkGetProject,
  updateProjectData,
  updateProbThreshold,
  getConfigure,
} from '../../store/project/projectActions';
import { ConfigurationInfo } from '../ConfigurationInfo/ConfigurationInfo';
import { camerasSelectorFactory } from '../../store/cameraSlice';
import { partNamesSelectorFactory, partOptionsSelectorFactory } from '../../store/partSlice';

import { AdditionalProps, DeploymentProps } from './ts/Deployment';

import { ConfigTaskPanel } from '../ConfigTaskPanel/ConfigTaskPanel';
import { EmptyAddIcon } from '../EmptyAddIcon';
import { getTrainingProject } from '../../store/trainingProjectSlice';
import { Insights } from './DeploymentInsights';
import { Instruction } from '../Instruction';
import { getImages, selectAllImages } from '../../store/imageSlice';
import { initialProjectData } from '../../store/project/projectReducer';
import { Progress } from './Progress';
import { VideoAnnosControls } from './VideoControls';
import { LiveViewScene } from '../LiveViewScene';

const { palette } = getTheme();

const BaseDeployment: React.FC<DeploymentProps> = (props) => {
  const { openCreatePanel, openEditPanel } = props;

  const { status, data: projectData, originData } = useSelector<State, Project>((state) => state.project);
  const {
    id: projectId,
    cameras: projectCameraIds,
    trainingProject,
    parts,
    sendMessageToCloud,
    framesPerMin,
    needRetraining,
    accuracyRangeMin,
    accuracyRangeMax,
    maxImages,
    name,
    probThreshold,
    fps,
  } = projectData;
  const camerasSelector = useMemo(() => camerasSelectorFactory(projectCameraIds), [projectCameraIds]);
  const cameraOptions: IDropdownOption[] = useSelector((state: State) =>
    camerasSelector(state).map((e) => ({ key: e?.id, text: e?.name })),
  );
  const [selectedCamera, setselectedCamera] = useState(projectCameraIds[0]);
  useEffect(() => {
    if (projectCameraIds.length) setselectedCamera(projectCameraIds[0]);
  }, [projectCameraIds]);

  const partNamesSelector = useMemo(() => partNamesSelectorFactory(parts), [parts]);
  const partOptionsSelector = useMemo(() => partOptionsSelectorFactory(trainingProject), [trainingProject]);
  const partOptions = useSelector(partOptionsSelector);
  const partNames = useSelector(partNamesSelector);
  const dispatch = useDispatch();
  const deployTimeStamp = useSelector((state: State) => state.project.data.deployTimeStamp);
  const newImagesCount = useSelector(
    (state: State) => selectAllImages(state).filter((e) => !e.uploaded && e.manualChecked).length,
  );

  useEffect(() => {
    dispatch(getTrainingProject(true));
    // The property `upload` would be changed after configure
    // Re fetch the images to get the latest data
    dispatch(getImages({ freezeRelabelImgs: false }));
  }, [dispatch]);

  const changeProbThreshold = (newValue: number) => dispatch(updateProjectData({ probThreshold: newValue }));
  const saveProbThresholde = () => dispatch(updateProbThreshold());

  const updateModel = useCallback(async () => {
    await dispatch(getConfigure(projectId));
  }, [dispatch, projectId]);

  const commandBarItems: ICommandBarItemProps[] = useMemo(() => {
    const items = [
      {
        key: 'create',
        text: 'Create new task',
        iconProps: {
          iconName: 'Add',
        },
        onClick: openCreatePanel,
      },
      {
        key: 'edit',
        text: 'Edit task',
        iconProps: {
          iconName: 'Edit',
        },
        onClick: openEditPanel,
      },
    ];

    if (newImagesCount)
      items.splice(1, 0, {
        key: 'update',
        text: 'Update model',
        iconProps: {
          iconName: 'Edit',
        },
        onClick: updateModel,
      });

    return items;
  }, [newImagesCount, openCreatePanel, openEditPanel, updateModel]);

  if (status === Status.None)
    return (
      <EmptyAddIcon
        title="Config a task"
        subTitle=""
        primary={{ text: 'Config task', onClick: openCreatePanel }}
      />
    );

  if (status === Status.WaitTraining) return <Progress projectId={projectId} cameraId={selectedCamera} />;

  return (
    <Stack styles={{ root: { height: '100%' } }}>
      <CommandBar items={commandBarItems} style={{ display: 'block' }} />
      <UpdateModelInstruction newImagesCount={newImagesCount} updateModel={updateModel} />
      <Stack horizontal grow>
        <Stack grow>
          <Stack tokens={{ childrenGap: 17, padding: 25 }} grow>
            <Stack grow>
              <LiveViewScene cameraId={selectedCamera} />
            </Stack>
            <Stack horizontal horizontalAlign="space-between">
              <Stack tokens={{ childrenGap: 10 }} styles={{ root: { minWidth: '200px' } }}>
                <Text variant="xLarge">{name}</Text>
                <Text styles={{ root: { color: palette.neutralSecondary } }}>
                  Started running <b>{moment(deployTimeStamp).fromNow()}</b>
                </Text>
              </Stack>
              <Dropdown
                options={cameraOptions}
                label="Select Camera"
                styles={{
                  root: { display: 'flex', alignItems: 'flex-start' },
                  dropdown: { width: '180px', marginLeft: '24px' },
                }}
                selectedKey={selectedCamera}
                onChange={(_, option) => setselectedCamera(option.key as number)}
              />
            </Stack>
          </Stack>
          <Separator styles={{ root: { padding: 0 } }} />
          <Stack tokens={{ childrenGap: 17, padding: 25 }}>
            <ConfigurationInfo
              cameraNames={cameraOptions.map((e) => e.text)}
              fps={fps}
              partNames={partNames}
              sendMessageToCloud={sendMessageToCloud}
              framesPerMin={framesPerMin}
              needRetraining={needRetraining}
              accuracyRangeMin={accuracyRangeMin}
              accuracyRangeMax={accuracyRangeMax}
              probThreshold={probThreshold}
              originProbThreshold={originData.probThreshold}
              updateProbThreshold={changeProbThreshold}
              saveProbThreshold={saveProbThresholde}
              maxImages={maxImages}
              SVTCcameraNames={cameraOptions
                .filter((e) => projectData.SVTCcameras.includes(e.key as number))
                .map((e) => e.text)}
              SVTCpartNames={partOptions
                .filter((e) => projectData.SVTCparts.includes(e.key as number))
                .map((e) => e.text)}
              SVTCisOpen={projectData.SVTCisOpen}
              SVTCthreshold={projectData.SVTCconfirmationThreshold}
              protocol={projectData.inferenceProtocol}
              isLVA={projectData.inferenceSource === InferenceSource.LVA}
            />
          </Stack>
        </Stack>
        {/* Vertical seperator has z-index in 1 as default, which will be on top of the panel */}
        <Separator vertical styles={{ root: { zIndex: 0 } }} />
        <Pivot styles={{ root: { borderBottom: `solid 1px ${palette.neutralLight}`, width: '435px' } }}>
          <PivotItem headerText="Insights">
            <Insights status={status} projectId={projectData.id} cameraId={selectedCamera} />
          </PivotItem>
          <PivotItem headerText="Areas of interest">
            <VideoAnnosControls cameraId={selectedCamera} />
          </PivotItem>
        </Pivot>
      </Stack>
    </Stack>
  );
};

export const Deployment = R.compose(
  (BaseComponent: React.ComponentType<AdditionalProps>): React.FC => () => {
    const [isEditPanelOpen, { setTrue: openEditPanel, setFalse: closeEditPanel }] = useBoolean(false);
    const [isCreatePanelOpen, { setTrue: openCreatePanel, setFalse: closeCreatePanel }] = useBoolean(false);

    const { data: projectData } = useSelector<State, Project>((state) => state.project);

    const dispatch = useDispatch();

    useEffect(() => {
      (async () => {
        const hasConfigured = await dispatch(thunkGetProject());
        if (!hasConfigured) openCreatePanel();
      })();
    }, [dispatch, openCreatePanel]);

    return (
      <>
        <BaseComponent openCreatePanel={openCreatePanel} openEditPanel={openEditPanel} />
        <ConfigTaskPanel
          isOpen={isEditPanelOpen}
          onDismiss={closeEditPanel}
          projectData={projectData}
          isEdit
        />
        <ConfigTaskPanel
          isOpen={isCreatePanelOpen}
          onDismiss={closeCreatePanel}
          projectData={initialProjectData}
        />
      </>
    );
  },
)(BaseDeployment);

// Extract this component so when every time the instruction being show,
// It will get the latest images
const UpdateModelInstruction = ({ newImagesCount, updateModel }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getImages({ freezeRelabelImgs: false }));
  }, [dispatch]);

  if (newImagesCount)
    return (
      <Instruction
        title={`${newImagesCount} new images have been added to your model!`}
        subtitle="Update the model to improve your current deployment"
        button={{ text: 'Update model', onClick: updateModel }}
        styles={{ root: { margin: '0px 25px' } }}
      />
    );

  return null;
};

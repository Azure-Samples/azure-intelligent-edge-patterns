import React, { useEffect, useState } from 'react';
import { Link as RRDLink } from 'react-router-dom';
import {
  Stack,
  PrimaryButton,
  ProgressIndicator,
  Text,
  getTheme,
  Separator,
  CommandBar,
  ICommandBarItemProps,
  Pivot,
  PivotItem,
  Link,
  IDropdownOption,
  Dropdown,
  Toggle,
  DefaultButton,
} from '@fluentui/react';
import { useSelector, useDispatch } from 'react-redux';
import * as R from 'ramda';
import { useBoolean } from '@uifabric/react-hooks';
import moment from 'moment';

import { State } from 'RootStateType';
import { LiveViewContainer } from './LiveViewContainer';
import { Project, Status, InferenceMode } from '../store/project/projectTypes';
import { useInterval } from '../hooks/useInterval';
import {
  thunkGetTrainingLog,
  thunkGetInferenceMetrics,
  thunkDeleteProject,
  thunkGetTrainingMetrics,
  thunkGetProject,
  updateProjectData,
  updateProbThreshold,
} from '../store/project/projectActions';
import { ConfigurationInfo } from './ConfigurationInfo/ConfigurationInfo';
import { selectCamerasByIds, selectCameraById } from '../store/cameraSlice';
import { selectPartNamesById } from '../store/partSlice';
import { ConfigTaskPanel } from './ConfigTaskPanel';
import { ExpandPanel } from './ExpandPanel';
import {
  selectVideoAnnosByCamera,
  selectOriginVideoAnnosByCamera,
  onCreateVideoAnnoBtnClick,
} from '../store/videoAnnoSlice';
import {
  toggleShowAOI,
  updateCameraArea,
  toggleShowCountingLines,
  toggleShowDangerZones,
} from '../store/actions';
import { Shape, Purpose } from '../store/shared/BaseShape';
import { EmptyAddIcon } from './EmptyAddIcon';
import { getTrainingProject } from '../store/trainingProjectSlice';

const { palette } = getTheme();

export const Deployment: React.FC = () => {
  const { status, progress, trainingLog, data: projectData, originData, inferenceMetrics } = useSelector<
    State,
    Project
  >((state) => state.project);
  const {
    id: projectId,
    cameras: projectCameraIds,
    trainingProject,
    parts,
    sendMessageToCloud,
    framesPerMin,
    accuracyThreshold,
    needRetraining,
    accuracyRangeMin,
    accuracyRangeMax,
    maxImages,
    name,
    probThreshold,
  } = projectData;
  const cameraOptions: IDropdownOption[] = useSelector((state: State) =>
    selectCamerasByIds(projectCameraIds)(state).map((e) => ({ key: e?.id, text: e?.name })),
  );
  const isDemo = useSelector((state: State) => {
    const trainingProjectId = state.project.data.trainingProject;
    return state.trainingProject.entities[trainingProjectId]?.isDemo;
  });
  const [selectedCamera, setselectedCamera] = useState(projectCameraIds[0]);
  useEffect(() => {
    if (projectCameraIds.length) setselectedCamera(projectCameraIds[0]);
  }, [projectCameraIds]);

  const partNames = useSelector(selectPartNamesById(parts));
  const dispatch = useDispatch();
  const objectCounts = useSelector((state: State) =>
    Object.entries(state.project.inferenceMetrics.partCount),
  );
  const deployTimeStamp = useSelector((state: State) => state.project.data.deployTimeStamp);

  const [isEditPanelOpen, { setTrue: openPanel, setFalse: closePanel }] = useBoolean(false);

  useEffect(() => {
    (async () => {
      const hasConfigured = await dispatch(thunkGetProject());
      if (!hasConfigured) openPanel();
    })();
  }, [dispatch, openPanel]);

  useEffect(() => {
    dispatch(getTrainingProject(true));
  }, [dispatch]);

  useInterval(
    () => {
      dispatch(thunkGetTrainingLog(projectId, isDemo, selectedCamera));
    },
    status === Status.WaitTraining ? 5000 : null,
  );

  useEffect(() => {
    if (status === Status.FinishTraining) {
      dispatch(thunkGetTrainingMetrics(trainingProject, isDemo));
    }
  }, [dispatch, status, projectId, isDemo, trainingProject]);

  useInterval(
    () => {
      dispatch(thunkGetInferenceMetrics(projectId, isDemo, selectedCamera));
    },
    status === Status.StartInference ? 5000 : null,
  );

  const changeProbThreshold = (newValue: string) =>
    dispatch(updateProjectData({ probThreshold: newValue }, false));
  const saveProbThresholde = () => dispatch(updateProbThreshold());

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'edit',
      text: 'Edit',
      iconProps: {
        iconName: 'Edit',
      },
      onClick: openPanel,
    },
    {
      key: 'delete',
      text: 'Delete',
      iconProps: {
        iconName: 'Delete',
      },
      onClick: () => {
        // Because onClick cannot accept the return type Promise<void>, use the IIFE to workaround
        (async () => {
          // eslint-disable-next-line no-restricted-globals
          if (!confirm('Sure you want to delete?')) return;

          await dispatch(thunkDeleteProject(false));
        })();
      },
    },
  ];

  const onRenderMain = () => {
    if (status === Status.None)
      return (
        <EmptyAddIcon
          title="Config a task"
          subTitle=""
          primary={{ text: 'Config task', onClick: openPanel }}
        />
      );
    if (status === Status.WaitTraining)
      return (
        <Stack horizontalAlign="center" verticalAlign="center" grow tokens={{ childrenGap: 24 }}>
          <Stack horizontalAlign="center" tokens={{ childrenGap: 5 }}>
            {progress !== null && (
              <>
                <Text variant="xxLarge">{`${progress}%`}</Text>
                <Text>{trainingLog}</Text>
              </>
            )}
          </Stack>
          <ProgressIndicator
            barHeight={4}
            styles={{ root: { width: '600px' }, progressBar: { backgroundColor: palette.tealLight } }}
            percentComplete={progress !== null ? progress / 100 : null}
          />
        </Stack>
      );

    return (
      <Stack horizontal grow>
        <Stack grow>
          <Stack tokens={{ childrenGap: 17, padding: 25 }} grow>
            <Stack grow>
              <LiveViewContainer showVideo={true} cameraId={selectedCamera} />
            </Stack>
            <Stack horizontal horizontalAlign="space-between">
              <Stack tokens={{ childrenGap: 10 }} styles={{ root: { minWidth: '200px' } }}>
                <Text variant="xLarge">{name}</Text>
                <Text styles={{ root: { color: palette.neutralSecondary } }}>
                  Started running <b>{moment(deployTimeStamp).fromNow()}</b>
                </Text>
                <CommandBar items={commandBarItems} styles={{ root: { padding: 0 } }} />
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
              cameraName={cameraOptions.map((e) => e.text).join(', ')}
              partNames={partNames}
              sendMessageToCloud={sendMessageToCloud}
              framesPerMin={framesPerMin}
              accuracyThreshold={accuracyThreshold}
              needRetraining={needRetraining}
              accuracyRangeMin={accuracyRangeMin}
              accuracyRangeMax={accuracyRangeMax}
              probThreshold={probThreshold}
              originProbThreshold={originData.probThreshold}
              updateProbThreshold={changeProbThreshold}
              saveProbThreshold={saveProbThresholde}
              maxImages={maxImages}
            />
          </Stack>
        </Stack>
        <Separator vertical />
        <Stack styles={{ root: { width: '435px' } }}>
          <Pivot styles={{ root: { borderBottom: `solid 1px ${palette.neutralLight}` } }}>
            <PivotItem headerText="Insights">
              <Insights
                successRate={inferenceMetrics.successRate}
                successfulInferences={inferenceMetrics.successfulInferences}
                unIdetifiedItems={inferenceMetrics.unIdetifiedItems}
                isGpu={inferenceMetrics.isGpu}
                averageTime={inferenceMetrics.averageTime}
                objectCounts={objectCounts}
              />
            </PivotItem>
            <PivotItem headerText="Areas of interest">
              <VideoAnnosControls cameraId={selectedCamera} />
            </PivotItem>
          </Pivot>
        </Stack>
      </Stack>
    );
  };

  return (
    <>
      <Stack horizontal styles={{ root: { height: '100%' } }}>
        {onRenderMain()}
      </Stack>
      <ConfigTaskPanel
        isOpen={isEditPanelOpen}
        onDismiss={closePanel}
        projectData={projectData}
        isDemo={isDemo}
        isEdit
      />
    </>
  );
};

type InsightsProps = {
  successRate: number;
  successfulInferences: number;
  unIdetifiedItems: number;
  objectCounts: [string, number][];
  isGpu: boolean;
  averageTime: number;
};

export const Insights: React.FC<InsightsProps> = ({
  successRate,
  successfulInferences,
  unIdetifiedItems,
  objectCounts,
  isGpu,
  averageTime,
}) => {
  return (
    <>
      <Stack
        styles={{ root: { padding: '24px 20px', borderBottom: `solid 1px ${palette.neutralLight}` } }}
        tokens={{ childrenGap: '8px' }}
      >
        <Text styles={{ root: { fontWeight: 'bold' } }}>Success rate</Text>
        <Text styles={{ root: { fontWeight: 'bold', color: palette.greenLight } }}>{successRate}%</Text>
        <Text>
          {`Running on ${isGpu ? 'GPU' : 'CPU'} (accelerated) ${Math.round(averageTime * 100) / 100}/ms`}
        </Text>
      </Stack>
      <Stack
        styles={{ root: { padding: '24px 20px', borderBottom: `solid 1px ${palette.neutralLight}` } }}
        tokens={{ childrenGap: '8px' }}
      >
        <Text styles={{ root: { fontWeight: 'bold' } }}>Successful inferences</Text>
        <Text styles={{ root: { color: palette.neutralSecondary } }}>{successfulInferences}</Text>
        <ExpandPanel titleHidden="Object" suffix={objectCounts.length.toString()}>
          <Stack tokens={{ childrenGap: 10 }}>
            {objectCounts.map((e) => (
              <Text key={e[0]}>{`${e[0]}: ${e[1]}`}</Text>
            ))}
          </Stack>
        </ExpandPanel>
      </Stack>
      <Stack
        styles={{ root: { padding: '24px 20px', borderBottom: `solid 1px ${palette.neutralLight}` } }}
        tokens={{ childrenGap: '8px' }}
      >
        <ExpandPanel titleHidden="Unidentified images" suffix={unIdetifiedItems?.toString()}>
          <Stack horizontal tokens={{ childrenGap: 25 }}>
            <Text variant="mediumPlus" styles={{ root: { color: palette.neutralPrimary } }}>
              {unIdetifiedItems} images
            </Text>
            <RRDLink to="/images" style={{ textDecoration: 'none' }}>
              <Link styles={{ root: { textDecoration: 'none' } }}>View in images</Link>
            </RRDLink>
          </Stack>
        </ExpandPanel>
      </Stack>
    </>
  );
};

type VideoAnnosControlsProps = {
  cameraId: number;
};

const VideoAnnosControls: React.FC<VideoAnnosControlsProps> = ({ cameraId }) => {
  const [loading, setLoading] = useState(false);
  const showAOI = useSelector<State, boolean>((state) => selectCameraById(state, cameraId)?.useAOI);
  const showCountingLine = useSelector<State, boolean>(
    (state) => selectCameraById(state, cameraId)?.useCountingLine,
  );
  const showDangerZone = useSelector<State, boolean>(
    (state) => selectCameraById(state, cameraId)?.useDangerZone,
  );
  const videoAnnos = useSelector(selectVideoAnnosByCamera(cameraId));
  const originVideoAnnos = useSelector(selectOriginVideoAnnosByCamera(cameraId));
  const [showUpdateSuccessTxt, setShowUpdateSuccessTxt] = useState(false);
  const videoAnnoShape = useSelector((state: State) => state.videoAnnos.shape);
  const videoAnnoPurpose = useSelector((state: State) => state.videoAnnos.purpose);
  const inferenceMode = useSelector((state: State) => state.project.data.inferenceMode);
  const dispatch = useDispatch();

  const onAOIToggleClick = async (): Promise<void> => {
    setLoading(true);
    await dispatch(toggleShowAOI({ cameraId, checked: !showAOI }));
    setShowUpdateSuccessTxt(true);
    setLoading(false);
  };

  const onCountingLineToggleClick = async () => {
    setLoading(true);
    await dispatch(toggleShowCountingLines({ cameraId, checked: !showCountingLine }));
    setShowUpdateSuccessTxt(true);
    setLoading(false);
  };

  const onDangerZoneToggleClick = async (): Promise<void> => {
    setLoading(true);
    await dispatch(toggleShowDangerZones({ cameraId, checked: !showDangerZone }));
    setShowUpdateSuccessTxt(true);
    setLoading(false);
  };

  const onUpdate = async (): Promise<void> => {
    setLoading(true);
    await dispatch(updateCameraArea(cameraId));
    setShowUpdateSuccessTxt(true);
    setLoading(false);
  };

  const hasEdit = !R.equals(originVideoAnnos, videoAnnos);
  const updateBtnDisabled = !hasEdit;

  return (
    <Stack tokens={{ childrenGap: 10 }}>
      <Toggle label="Enable area of interest" checked={showAOI} onClick={onAOIToggleClick} inlineLabel />
      <DefaultButton
        text="Create Box"
        primary={videoAnnoShape === Shape.BBox && videoAnnoPurpose === Purpose.AOI}
        disabled={!showAOI}
        onClick={(): void => {
          dispatch(onCreateVideoAnnoBtnClick({ shape: Shape.BBox, purpose: Purpose.AOI }));
        }}
        style={{ padding: '0 5px' }}
      />
      <DefaultButton
        text={videoAnnoShape === Shape.Polygon ? 'Press D to Finish' : 'Create Polygon'}
        primary={videoAnnoShape === Shape.Polygon && videoAnnoPurpose === Purpose.AOI}
        disabled={!showAOI}
        onClick={(): void => {
          dispatch(onCreateVideoAnnoBtnClick({ shape: Shape.Polygon, purpose: Purpose.AOI }));
        }}
        style={{ padding: '0 5px' }}
      />
      {[InferenceMode.PartCounting, InferenceMode.DefectDetection].includes(inferenceMode) && (
        <>
          <Toggle
            label="Enable counting lines"
            checked={showCountingLine}
            onClick={onCountingLineToggleClick}
            inlineLabel
          />
          <DefaultButton
            text="Create counting line"
            primary={videoAnnoShape === Shape.Line && videoAnnoPurpose === Purpose.Counting}
            disabled={!showCountingLine}
            onClick={(): void => {
              dispatch(onCreateVideoAnnoBtnClick({ shape: Shape.Line, purpose: Purpose.Counting }));
            }}
          />
        </>
      )}
      {inferenceMode === InferenceMode.EmployeeSafety && (
        <>
          <Toggle
            label="Enable danger zones"
            checked={showDangerZone}
            onClick={onDangerZoneToggleClick}
            inlineLabel
          />
          <DefaultButton
            text="Create danger zone"
            primary={videoAnnoShape === Shape.BBox && videoAnnoPurpose === Purpose.DangerZone}
            disabled={!showDangerZone}
            onClick={(): void => {
              dispatch(onCreateVideoAnnoBtnClick({ shape: Shape.BBox, purpose: Purpose.DangerZone }));
            }}
          />
        </>
      )}
      <Text style={{ visibility: showUpdateSuccessTxt ? 'visible' : 'hidden' }}>Updated!</Text>
      <PrimaryButton text="Update" disabled={updateBtnDisabled || loading} onClick={onUpdate} />
    </Stack>
  );
};

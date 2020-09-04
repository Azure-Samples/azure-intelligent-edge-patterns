import React, { useEffect, useState } from 'react';
import {
  Stack,
  PrimaryButton,
  ProgressIndicator,
  Text,
  getTheme,
  Separator,
  CommandBar,
  ICommandBarItemProps,
} from '@fluentui/react';
import { useSelector, useDispatch } from 'react-redux';

import { State } from 'RootStateType';
import { LiveViewContainer } from './LiveViewContainer';
import { Project, Status } from '../store/project/projectTypes';
import { useInterval } from '../hooks/useInterval';
import {
  thunkGetTrainingLog,
  thunkGetInferenceMetrics,
  thunkDeleteProject,
  thunkGetTrainingMetrics,
  thunkGetProject,
} from '../store/project/projectActions';
import { ConfigurationInfo } from './ConfigurationInfo/ConfigurationInfo';
import { selectCameraById } from '../store/cameraSlice';
import { selectTrainingProjectById } from '../store/trainingProjectSlice';
import { selectPartNamesById } from '../store/partSlice';
import { ConfigTaskPanel } from './ConfigTaskPanel';

const { palette } = getTheme();

export const Deployment: React.FC<{ isDemo: boolean }> = ({ isDemo }) => {
  const { status, progress, trainingLog, data: projectData } = useSelector<State, Project>(
    (state) => state.project,
  );
  const {
    id: projectId,
    camera: projectCameraId,
    trainingProject,
    parts,
    sendMessageToCloud,
    framesPerMin,
    accuracyThreshold,
    needRetraining,
    accuracyRangeMin,
    accuracyRangeMax,
    maxImages,
  } = projectData;
  const cameraName = useSelector((state: State) => selectCameraById(state, projectCameraId)?.name);
  const trainingProjectName = useSelector(
    (state: State) => selectTrainingProjectById(state, trainingProject)?.name,
  );
  const partNames = useSelector(selectPartNamesById(parts));
  const dispatch = useDispatch();

  const [isEditPanelOpen, setisEditPanelOpen] = useState(false);
  const openPanel = () => setisEditPanelOpen(true);
  const closePanel = () => setisEditPanelOpen(false);

  useEffect(() => {
    dispatch(thunkGetProject());
  }, [dispatch]);

  useInterval(
    () => {
      dispatch(thunkGetTrainingLog(projectId, isDemo));
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
      dispatch(thunkGetInferenceMetrics(projectId, isDemo));
    },
    status === Status.StartInference ? 5000 : null,
  );

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
    if (status === Status.None) return <PrimaryButton onClick={openPanel}>Config Task</PrimaryButton>;
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
              <LiveViewContainer showVideo={true} cameraId={projectData.camera} onDeleteProject={() => {}} />
            </Stack>
            <Stack tokens={{ childrenGap: 10 }} styles={{ root: { height: '100px' } }}>
              <Text variant="xLarge">Part Identification</Text>
              <Text>Started running 15 minutes ago</Text>
              <CommandBar items={commandBarItems} />
            </Stack>
          </Stack>
          <Separator styles={{ root: { padding: 0 } }} />
          <Stack tokens={{ childrenGap: 17, padding: 25 }}>
            <ConfigurationInfo
              cameraName={cameraName}
              partNames={partNames}
              sendMessageToCloud={sendMessageToCloud}
              framesPerMin={framesPerMin}
              accuracyThreshold={accuracyThreshold}
              needRetraining={needRetraining}
              accuracyRangeMin={accuracyRangeMin}
              accuracyRangeMax={accuracyRangeMax}
              maxImages={maxImages}
            />
          </Stack>
        </Stack>
        <Separator vertical />
        <Stack styles={{ root: { width: '435px' } }}>info</Stack>
      </Stack>
    );
  };

  return (
    <>
      <Stack horizontal styles={{ root: { height: '100%' } }}>
        {onRenderMain()}
      </Stack>
      <ConfigTaskPanel isOpen={isEditPanelOpen} onDismiss={closePanel} projectData={projectData} />
    </>
  );
};

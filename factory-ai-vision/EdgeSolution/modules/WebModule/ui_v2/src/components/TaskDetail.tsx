import React, { useEffect } from 'react';
import { Stack } from '@fluentui/react';
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

export const TaskDetail: React.FC<{ isDemo: boolean }> = ({ isDemo }) => {
  const {
    error,
    trainingLogs,
    status,
    trainingMetrics,
    data: { id: projectId, camera: projectCameraId, trainingProject },
    progress,
    inferenceMetrics: { partCount },
  } = useSelector<State, Project>((state) => state.project);
  const dispatch = useDispatch();

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

  const onDeleteProject = (): void => {
    dispatch(thunkDeleteProject(isDemo));
  };

  if (status === Status.None) return null;

  if (status === Status.WaitTraining)
    return (
      // <div style={{ width: '600px' }}>
      //   {progress !== null && <ProgressBar percentage={progress} />}
      //   <pre>{trainingLogs.join('\n')}</pre>
      // </div>
      <h1>Training</h1>
    );

  return (
    <Stack horizontal styles={{ root: { height: '100%' } }}>
      <div style={{ width: '30%' }}></div>
      <div style={{ height: '90%', width: '70%' }}>
        <LiveViewContainer showVideo={true} cameraId={projectCameraId} onDeleteProject={onDeleteProject} />
      </div>
    </Stack>
  );
};

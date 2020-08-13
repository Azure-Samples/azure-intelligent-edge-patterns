import Axios from 'axios';
import * as R from 'ramda';
import {
  ProjectThunk,
  GetProjectSuccessAction,
  GET_PROJECT_SUCCESS,
  GetProjectFailedAction,
  GET_PROJECT_FAILED,
  PostProjectSuccessAction,
  POST_PROJECT_SUCCESS,
  POST_PROJECT_FALIED,
  PostProjectFaliedAction,
  DeleteProjectSuccessAction,
  DELETE_PROJECT_SUCCESS,
  DeleteProjectFaliedAction,
  DELETE_PROJECT_FALIED,
  ProjectData,
  PostProjectRequestAction,
  POST_PROJECT_REQUEST,
  GetProjectRequestAction,
  GET_PROJECT_REQUEST,
  UpdateProjectDataAction,
  UPDATE_PROJECT_DATA,
  GetTrainingLogRequesAction,
  GET_TRAINING_LOG_REQUEST,
  GetTrainingLogSuccessAction,
  GET_TRAINING_LOG_SUCCESS,
  GetTrainingLogFailedAction,
  GET_TRAINING_LOG_FAILED,
  Status,
  GetTrainingMetricsRequestAction,
  GET_TRAINING_METRICS_REQUEST,
  GetTrainingMetricsSuccessAction,
  GET_TRAINING_METRICS_SUCCESS,
  GetTrainingMetricsFailedAction,
  GET_TRAINING_METRICS_FAILED,
  Consequence,
  GetInferenceMetricsRequestAction,
  GET_INFERENCE_METRICS_REQUEST,
  GET_INFERENCE_METRICS_SUCCESS,
  GetInferenceMetricsSuccessAction,
  GetInferenceMetricsFailedAction,
  GET_INFERENCE_METRICS_FAILED,
  StartInferenceAction,
  START_INFERENCE,
  STOP_INFERENCE,
  StopInferenceAction,
  UPDATE_ORIGIN_PROJECT_DATA,
  UpdateOriginProjectDataAction,
  ChangeStatusAction,
  UpdateProbThresholdRequestAction,
  UpdateProbThresholdSuccessAction,
  UpdateProbThresholdFailedAction,
  TrainingStatus,
} from './projectTypes';
import { State } from '../State';

const getProjectRequest = (isDemo: boolean): GetProjectRequestAction => ({
  type: GET_PROJECT_REQUEST,
  isDemo,
});
const getProjectSuccess = (
  project: ProjectData,
  hasConfigured: boolean,
  isDemo: boolean,
): GetProjectSuccessAction => ({
  type: GET_PROJECT_SUCCESS,
  payload: { project, hasConfigured },
  isDemo,
});
const getProjectFailed = (error: Error, isDemo: boolean): GetProjectFailedAction => ({
  type: GET_PROJECT_FAILED,
  error,
  isDemo,
});

const getTrainingLogRequest = (isDemo: boolean): GetTrainingLogRequesAction => ({
  type: GET_TRAINING_LOG_REQUEST,
  isDemo,
});
const getTrainingLogSuccess = (
  trainingLog: string,
  newStatus: Status,
  isDemo: boolean,
  progress: number,
): GetTrainingLogSuccessAction => ({
  type: GET_TRAINING_LOG_SUCCESS,
  payload: {
    trainingLog,
    newStatus,
    progress,
  },
  isDemo,
});
const getTrainingStatusFailed = (error: Error, isDemo: boolean): GetTrainingLogFailedAction => ({
  type: GET_TRAINING_LOG_FAILED,
  error,
  isDemo,
});

const postProjectRequest = (isDemo: boolean): PostProjectRequestAction => ({
  type: POST_PROJECT_REQUEST,
  isDemo,
});
const postProjectSuccess = (data: any, isDemo: boolean): PostProjectSuccessAction => ({
  type: POST_PROJECT_SUCCESS,
  data: {
    id: data?.id ?? null,
    camera: data?.camera ?? null,
    location: data?.location ?? null,
    parts: data?.parts ?? [],
    modelUrl: data?.download_uri ?? '',
    needRetraining: data?.needRetraining ?? true,
    accuracyRangeMin: data?.accuracyRangeMin ?? 60,
    accuracyRangeMax: data?.accuracyRangeMax ?? 80,
    maxImages: data?.maxImages ?? 20,
    sendMessageToCloud: data?.metrics_is_send_iothub,
    framesPerMin: data?.metrics_frame_per_minutes,
    accuracyThreshold: data?.metrics_accuracy_threshold,
    cvProjectId: data?.customvision_project_id,
    probThreshold: data?.prob_threshold.toString() ?? '10',
  },
  isDemo,
});
const postProjectFail = (error: Error, isDemo: boolean): PostProjectFaliedAction => ({
  type: POST_PROJECT_FALIED,
  error,
  isDemo,
});

const deleteProjectSuccess = (isDemo: boolean): DeleteProjectSuccessAction => ({
  type: DELETE_PROJECT_SUCCESS,
  isDemo,
});
const deleteProjectFailed = (isDemo: boolean): DeleteProjectFaliedAction => ({
  type: DELETE_PROJECT_FALIED,
  isDemo,
});

const getTrainingMetricsRequest = (isDemo: boolean): GetTrainingMetricsRequestAction => ({
  type: GET_TRAINING_METRICS_REQUEST,
  isDemo,
});
const getTrainingMetricsSuccess = (
  curConsequence: Consequence,
  prevConsequence: Consequence,
  isDemo: boolean,
): GetTrainingMetricsSuccessAction => ({
  type: GET_TRAINING_METRICS_SUCCESS,
  payload: { prevConsequence, curConsequence },
  isDemo,
});
const getTrainingMetricsFailed = (error: Error, isDemo: boolean): GetTrainingMetricsFailedAction => ({
  type: GET_TRAINING_METRICS_FAILED,
  error,
  isDemo,
});

const getInferenceMetricsRequest = (isDemo: boolean): GetInferenceMetricsRequestAction => ({
  type: GET_INFERENCE_METRICS_REQUEST,
  isDemo,
});
const getInferenceMetricsSuccess = (
  successRate: number,
  successfulInferences: number,
  unIdetifiedItems: number,
  isGpu: boolean,
  averageTime: number,
  partCount: Record<string, number>,
  isDemo: boolean,
): GetInferenceMetricsSuccessAction => ({
  type: GET_INFERENCE_METRICS_SUCCESS,
  payload: { successRate, successfulInferences, unIdetifiedItems, isGpu, averageTime, partCount },
  isDemo,
});
const getInferenceMetricsFailed = (error: Error, isDemo: boolean): GetInferenceMetricsFailedAction => ({
  type: GET_INFERENCE_METRICS_FAILED,
  error,
  isDemo,
});

export const startInference = (isDemo: boolean): StartInferenceAction => ({
  type: START_INFERENCE,
  isDemo,
});

export const stopInference = (isDemo: boolean): StopInferenceAction => ({
  type: STOP_INFERENCE,
  isDemo,
});

export const updateProjectData = (
  partialProjectData: Partial<ProjectData>,
  isDemo: boolean,
): UpdateProjectDataAction => ({
  type: UPDATE_PROJECT_DATA,
  payload: partialProjectData,
  isDemo,
});

export const updateOriginProjectData = (isDemo: boolean): UpdateOriginProjectDataAction => ({
  type: UPDATE_ORIGIN_PROJECT_DATA,
  isDemo,
});

export const changeStatus = (status: Status, isDemo: boolean): ChangeStatusAction => ({
  type: 'CHANGE_STATUS',
  status,
  isDemo,
});

const updateProbThresholdRequest = (isDemo: boolean): UpdateProbThresholdRequestAction => ({
  type: 'UPDATE_PROB_THRESHOLD_REQUEST',
  isDemo,
});

const updateProbThresholdSuccess = (isDemo: boolean): UpdateProbThresholdSuccessAction => ({
  type: 'UPDATE_PROB_THRESHOLD_SUCCESS',
  isDemo,
});

const updateProbThresholdFailed = (error: Error, isDemo: boolean): UpdateProbThresholdFailedAction => ({
  type: 'UPDATE_PROB_THRESHOLD_FAILED',
  error,
  isDemo,
});

const getProjectDataByDemo = (isDemo: boolean, state: State): ProjectData => {
  if (isDemo) return state.demoProject.data;
  return state.project.data;
};

export const thunkGetProject = (isDemo: boolean): ProjectThunk => (dispatch): Promise<void> => {
  dispatch(getProjectRequest(isDemo));

  const url = isDemo === undefined ? '/api/projects/' : `/api/projects/?is_demo=${Number(isDemo)}`;

  return Axios.get(url)
    .then(({ data }) => {
      const project: ProjectData = {
        id: data[0]?.id ?? null,
        camera: data[0]?.camera ?? null,
        location: data[0]?.location ?? null,
        parts: data[0]?.parts ?? [],
        modelUrl: data[0]?.download_uri ?? '',
        needRetraining: data[0]?.needRetraining ?? true,
        accuracyRangeMin: data[0]?.accuracyRangeMin ?? 60,
        accuracyRangeMax: data[0]?.accuracyRangeMax ?? 80,
        maxImages: data[0]?.maxImages ?? 20,
        sendMessageToCloud: data[0]?.metrics_is_send_iothub,
        framesPerMin: data[0]?.metrics_frame_per_minutes,
        accuracyThreshold: data[0]?.metrics_accuracy_threshold,
        cvProjectId: data[0]?.customvision_project_id,
        probThreshold: data[0]?.prob_threshold.toString() ?? '10',
      };
      dispatch(getProjectSuccess(project, data[0]?.has_configured, isDemo));
      return void 0;
    })
    .catch((err) => {
      dispatch(getProjectFailed(err, isDemo));
    });
};

export const thunkPostProject = (
  projectId,
  selectedLocations,
  selectedParts,
  selectedCamera,
  isDemo,
): ProjectThunk => (dispatch, getState): Promise<number> => {
  const isProjectEmpty = projectId === null;
  const url = isProjectEmpty ? `/api/projects/` : `/api/projects/${projectId}/`;

  dispatch(postProjectRequest(isDemo));

  const projectData = getProjectDataByDemo(isDemo, getState());

  return Axios(url, {
    data: {
      location: selectedLocations.id,
      parts: selectedParts.map((e) => e.id),
      camera: selectedCamera.id,
      download_uri: projectData.modelUrl,
      needRetraining: projectData.needRetraining,
      accuracyRangeMin: projectData.accuracyRangeMin,
      accuracyRangeMax: projectData.accuracyRangeMax,
      maxImages: projectData.maxImages,
      metrics_is_send_iothub: projectData.sendMessageToCloud,
      metrics_frame_per_minutes: projectData.framesPerMin,
      metrics_accuracy_threshold: projectData.accuracyThreshold,
    },
    method: isProjectEmpty ? 'POST' : 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(({ data }) => {
      dispatch(postProjectSuccess(data, isDemo));
      getTrain(data.id, isDemo);
      return data.id;
    })
    .catch((err) => {
      dispatch(postProjectFail(err, isDemo));
    }) as Promise<number>;
};
const getTrain = (projectId, isTestModel: boolean): void => {
  const url = isTestModel ? `/api/projects/${projectId}/train?demo=True` : `/api/projects/${projectId}/train`;
  Axios.get(url).catch((err) => console.error(err));
};

export const thunkDeleteProject = (isDemo): ProjectThunk => (dispatch, getState): Promise<any> => {
  const projectId = getProjectDataByDemo(isDemo, getState()).id;
  return Axios.get(`/api/projects/${projectId}/reset_camera`)
    .then(() => {
      return dispatch(deleteProjectSuccess(isDemo));
    })
    .catch((err) => {
      alert(err);
      dispatch(deleteProjectFailed(isDemo));
    });
};

export const thunkGetTrainingLog = (projectId: number, isDemo: boolean) => (dispatch): Promise<any> => {
  dispatch(getTrainingLogRequest(isDemo));

  return Axios.get(`/api/projects/${projectId}/export`)
    .then(({ data }) => {
      if (data.status === 'failed') throw new Error(data.log);
      else if (data.status === 'ok' || data.status === 'demo ok')
        dispatch(getTrainingLogSuccess('', Status.FinishTraining, isDemo, 0));
      else
        dispatch(getTrainingLogSuccess(data.log, Status.WaitTraining, isDemo, TrainingStatus[data.status]));
      return void 0;
    })
    .catch((err) => dispatch(getTrainingStatusFailed(err, isDemo)));
};

export const thunkGetTrainingMetrics = (projectId: number, isDemo: boolean) => (dispacth): Promise<any> => {
  dispacth(getTrainingMetricsRequest(isDemo));

  return Axios.get(`/api/projects/${projectId}/train_performance`)
    .then(({ data }) => {
      const curConsequence: Consequence = data.new
        ? {
            precision: data.new.precision,
            recall: data.new.recall,
            mAP: data.new.map,
          }
        : null;

      const prevConsequence: Consequence = data.previous
        ? {
            precision: data.previous.precision,
            recall: data.previous.recall,
            mAP: data.previous.map,
          }
        : null;

      return dispacth(getTrainingMetricsSuccess(curConsequence, prevConsequence, isDemo));
    })
    .catch((err) => dispacth(getTrainingMetricsFailed(err, isDemo)));
};

export const thunkGetInferenceMetrics = (projectId: number, isDemo: boolean) => (dispatch): Promise<any> => {
  dispatch(getInferenceMetricsRequest(isDemo));

  return Axios.get(`/api/projects/${projectId}/export`)
    .then(({ data }) => {
      return dispatch(
        getInferenceMetricsSuccess(
          data.success_rate,
          data.inference_num,
          data.unidentified_num,
          data.gpu,
          data.average_time,
          // TODO: Get it from server
          { part1: 10, part2: 20 },
          isDemo,
        ),
      );
    })
    .catch((err) => dispatch(getInferenceMetricsFailed(err, isDemo)));
};

export const thunkUpdateProbThreshold = (isDemo: boolean): ProjectThunk => (
  dispatch,
  getState,
): Promise<any> => {
  dispatch(updateProbThresholdRequest(isDemo));
  const { id: projectId, probThreshold } = getProjectDataByDemo(isDemo, getState());

  return Axios.get(`/api/projects/${projectId}/update_prob_threshold?prob_threshold=${probThreshold}`)
    .then(() => dispatch(updateProbThresholdSuccess(isDemo)))
    .catch((e) => {
      if (e.response) {
        throw new Error(e.response.data.log);
      } else if (e.request) {
        throw new Error(e.request);
      } else {
        throw e;
      }
    })
    .catch((e) => {
      dispatch(updateProbThresholdFailed(e, isDemo));
    });
};

export const thunkUpdateAccuracyRange = (isDemo: boolean): ProjectThunk => (
  dispatch,
  getState,
): Promise<any> => {
  dispatch(postProjectRequest(isDemo));
  const { id: projectId, accuracyRangeMin, accuracyRangeMax } = getProjectDataByDemo(isDemo, getState());

  return Axios.patch(`/api/projects/${projectId}/`, {
    accuracyRangeMin,
    accuracyRangeMax,
  })
    .then(({ data }) => {
      dispatch(postProjectSuccess(data, isDemo));
      return void 0;
    })
    .catch((e) => {
      if (e.response) {
        throw new Error(e.response.data.log);
      } else if (e.request) {
        throw new Error(e.request);
      } else {
        throw e;
      }
    })
    .catch((e) => {
      dispatch(postProjectFail(e, isDemo));
    });
};

export const thunkCheckAndSetAccuracyRange = (newSelectedParts: any[], isDemo: boolean) => (
  dispatch,
  getState,
): void => {
  const images = getState().images.filter((e) => !e.is_relabel);

  const partsWithImageLength = images.reduce((acc, cur) => {
    const { id } = cur.part;
    const relatedPartIdx = acc.findIndex((e) => e.id === id);
    if (relatedPartIdx >= 0) acc[relatedPartIdx].length = acc[relatedPartIdx].length + 1 || 1;
    return acc;
  }, R.clone(newSelectedParts));

  const minimumLengthPart = partsWithImageLength.reduce(
    (acc, cur) => {
      if (cur.length < acc.length) return { name: cur.name, length: cur.length };
      return acc;
    },
    { name: '', length: Infinity },
  );
  if (minimumLengthPart.length === Infinity) return;
  if (minimumLengthPart.length < 30) {
    dispatch(updateProjectData({ accuracyRangeMax: 40, accuracyRangeMin: 10 }, isDemo));
  } else if (minimumLengthPart.length >= 30 && minimumLengthPart.length < 80) {
    dispatch(updateProjectData({ accuracyRangeMax: 60, accuracyRangeMin: 30 }, isDemo));
  } else if (minimumLengthPart.length >= 80 && minimumLengthPart.length < 130) {
    dispatch(updateProjectData({ accuracyRangeMax: 80, accuracyRangeMin: 50 }, isDemo));
  } else if (minimumLengthPart.length >= 130) {
    dispatch(updateProjectData({ accuracyRangeMax: 90, accuracyRangeMin: 60 }, isDemo));
  }
};

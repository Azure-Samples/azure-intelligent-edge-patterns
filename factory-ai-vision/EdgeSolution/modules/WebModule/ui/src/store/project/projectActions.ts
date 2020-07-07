import Axios from 'axios';
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
  ResetStatusAction,
  RESET_STATUS,
  UpdateProbThresholdRequestAction,
  UpdateProbThresholdSuccessAction,
  UpdateProbThresholdFailedAction,
} from './projectTypes';

const getProjectRequest = (): GetProjectRequestAction => ({ type: GET_PROJECT_REQUEST });
const getProjectSuccess = (project: ProjectData): GetProjectSuccessAction => ({
  type: GET_PROJECT_SUCCESS,
  payload: { project },
});
const getProjectFailed = (error: Error): GetProjectFailedAction => ({ type: GET_PROJECT_FAILED, error });

const getTrainingLogRequest = (): GetTrainingLogRequesAction => ({ type: GET_TRAINING_LOG_REQUEST });
const getTrainingLogSuccess = (trainingLog: string, newStatus: Status): GetTrainingLogSuccessAction => ({
  type: GET_TRAINING_LOG_SUCCESS,
  payload: {
    trainingLog,
    newStatus,
  },
});
const getTrainingStatusFailed = (error: Error): GetTrainingLogFailedAction => ({
  type: GET_TRAINING_LOG_FAILED,
  error,
});

const postProjectRequest = (): PostProjectRequestAction => ({ type: POST_PROJECT_REQUEST });
const postProjectSuccess = (): PostProjectSuccessAction => ({ type: POST_PROJECT_SUCCESS });
const postProjectFail = (error: Error): PostProjectFaliedAction => ({ type: POST_PROJECT_FALIED, error });

const deleteProjectSuccess = (): DeleteProjectSuccessAction => ({ type: DELETE_PROJECT_SUCCESS });
const deleteProjectFailed = (): DeleteProjectFaliedAction => ({ type: DELETE_PROJECT_FALIED });

const getTrainingMetricsRequest = (): GetTrainingMetricsRequestAction => ({
  type: GET_TRAINING_METRICS_REQUEST,
});
const getTrainingMetricsSuccess = (
  curConsequence: Consequence,
  prevConsequence: Consequence,
): GetTrainingMetricsSuccessAction => ({
  type: GET_TRAINING_METRICS_SUCCESS,
  payload: { prevConsequence, curConsequence },
});
const getTrainingMetricsFailed = (error: Error): GetTrainingMetricsFailedAction => ({
  type: GET_TRAINING_METRICS_FAILED,
  error,
});

const getInferenceMetricsRequest = (): GetInferenceMetricsRequestAction => ({
  type: GET_INFERENCE_METRICS_REQUEST,
});
const getInferenceMetricsSuccess = (
  successRate: number,
  successfulInferences: number,
  unIdetifiedItems: number,
  isGpu: boolean,
  averageTime: number,
): GetInferenceMetricsSuccessAction => ({
  type: GET_INFERENCE_METRICS_SUCCESS,
  payload: { successRate, successfulInferences, unIdetifiedItems, isGpu, averageTime },
});
const getInferenceMetricsFailed = (error: Error): GetInferenceMetricsFailedAction => ({
  type: GET_INFERENCE_METRICS_FAILED,
  error,
});

export const startInference = (): StartInferenceAction => ({
  type: START_INFERENCE,
});

export const stopInference = (): StopInferenceAction => ({
  type: STOP_INFERENCE,
});

export const updateProjectData = (partialProjectData: Partial<ProjectData>): UpdateProjectDataAction => ({
  type: UPDATE_PROJECT_DATA,
  payload: partialProjectData,
});

export const updateOriginProjectData = (): UpdateOriginProjectDataAction => ({
  type: UPDATE_ORIGIN_PROJECT_DATA,
});

export const resetStatus = (): ResetStatusAction => ({
  type: RESET_STATUS,
});

const updateProbThresholdRequest = (): UpdateProbThresholdRequestAction => ({
  type: 'UPDATE_PROB_THRESHOLD_REQUEST',
});

const updateProbThresholdSuccess = (): UpdateProbThresholdSuccessAction => ({
  type: 'UPDATE_PROB_THRESHOLD_SUCCESS',
});

const updateProbThresholdFailed = (error: Error): UpdateProbThresholdFailedAction => ({
  type: 'UPDATE_PROB_THRESHOLD_FAILED',
  error,
});

export const thunkGetProject = (isTestModel?: boolean): ProjectThunk => (dispatch): Promise<void> => {
  dispatch(getProjectRequest());

  const url = isTestModel === undefined ? '/api/projects/' : `/api/projects/?is_demo=${Number(isTestModel)}`;

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
      dispatch(getProjectSuccess(project));
      return void 0;
    })
    .catch((err) => {
      dispatch(getProjectFailed(err));
    });
};

export const thunkPostProject = (
  projectId,
  selectedLocations,
  selectedParts,
  selectedCamera,
  isTestModel,
): ProjectThunk => (dispatch, getState): Promise<number> => {
  const isProjectEmpty = projectId === null;
  const url = isProjectEmpty ? `/api/projects/` : `/api/projects/${projectId}/`;

  dispatch(postProjectRequest());

  const projectData = getState().project.data;

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
      dispatch(postProjectSuccess());
      getTrain(data.id, isTestModel);
      return data.id;
    })
    .catch((err) => {
      dispatch(postProjectFail(err));
    }) as Promise<number>;
};
const getTrain = (projectId, isTestModel: boolean): void => {
  const url = isTestModel ? `/api/projects/${projectId}/train?demo=True` : `/api/projects/${projectId}/train`;
  Axios.get(url).catch((err) => console.error(err));
};

export const thunkDeleteProject = (projectId): ProjectThunk => (dispatch): Promise<any> => {
  return Axios.get(`/api/projects/${projectId}/reset_camera`)
    .then(() => {
      return dispatch(deleteProjectSuccess());
    })
    .catch((err) => {
      alert(err);
      dispatch(deleteProjectFailed());
    });
};

export const thunkGetTrainingLog = (projectId: number) => (dispatch): Promise<any> => {
  dispatch(getTrainingLogRequest());

  return Axios.get(`/api/projects/${projectId}/export`)
    .then(({ data }) => {
      if (data.status === 'failed') throw new Error(data.log);
      else if (data.status === 'ok' || data.status === 'demo ok')
        dispatch(getTrainingLogSuccess('', Status.FinishTraining));
      else dispatch(getTrainingLogSuccess(data.log, Status.WaitTraining));
      return void 0;
    })
    .catch((err) => dispatch(getTrainingStatusFailed(err)));
};

export const thunkGetTrainingMetrics = (projectId: number) => (dispacth): Promise<any> => {
  dispacth(getTrainingMetricsRequest());

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

      return dispacth(getTrainingMetricsSuccess(curConsequence, prevConsequence));
    })
    .catch((err) => dispacth(getTrainingMetricsFailed(err)));
};

export const thunkGetInferenceMetrics = (projectId: number) => (dispatch): Promise<any> => {
  dispatch(getInferenceMetricsRequest());

  return Axios.get(`/api/projects/${projectId}/export`)
    .then(({ data }) => {
      return dispatch(
        getInferenceMetricsSuccess(
          data.success_rate,
          data.inference_num,
          data.unidentified_num,
          data.gpu,
          data.average_time,
        ),
      );
    })
    .catch((err) => dispatch(getInferenceMetricsFailed(err)));
};

export const thunkUpdateProbThreshold = (): ProjectThunk => (dispatch, getState): Promise<any> => {
  dispatch(updateProbThresholdRequest());

  const projectId = getState().project.data.id;
  const { probThreshold } = getState().project.data;

  return Axios.get(`/api/projects/${projectId}/update_prob_threshold?prob_threshold=${probThreshold}`)
    .then(() => dispatch(updateProbThresholdSuccess()))
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
      dispatch(updateProbThresholdFailed(e));
    });
};

export const thunkUpdateAccuracyRange = (): ProjectThunk => (dispatch, getState): Promise<any> => {
  dispatch(postProjectRequest());

  const projectId = getState().project.data.id;
  const { accuracyRangeMin, accuracyRangeMax } = getState().project.data;

  return Axios.patch(`/api/projects/${projectId}/`, {
    accuracyRangeMin,
    accuracyRangeMax,
  })
    .then(() => {
      dispatch(postProjectSuccess());
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
      dispatch(postProjectFail(e));
    });
};

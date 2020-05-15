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
  GetTrainingMetricRequestAction,
  GET_TRAINING_METRIC_REQUEST,
  GetTrainingMetricSuccessAction,
  GET_TRAINING_METRIC_SUCCESS,
  GetTrainingMetricFailedAction,
  GET_TRAINING_METRIC_FAILED,
  Consequence,
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

const getTrainingMetricRequest = (): GetTrainingMetricRequestAction => ({
  type: GET_TRAINING_METRIC_REQUEST,
});
const getTrainingMetricSuccess = (
  curConsequence: Consequence,
  prevConsequence: Consequence,
): GetTrainingMetricSuccessAction => ({
  type: GET_TRAINING_METRIC_SUCCESS,
  payload: { prevConsequence, curConsequence },
});
const getTrainingMetricFailed = (error: Error): GetTrainingMetricFailedAction => ({
  type: GET_TRAINING_METRIC_FAILED,
  error,
});

export const updateProjectData = (projectData: ProjectData): UpdateProjectDataAction => ({
  type: UPDATE_PROJECT_DATA,
  payload: projectData,
});

export const thunkGetProject = (): ProjectThunk => (dispatch): Promise<void> => {
  dispatch(getProjectRequest());

  return Axios.get('/api/projects/')
    .then(({ data }) => {
      const project: ProjectData = {
        id: data[0]?.id ?? null,
        camera: parseInt(data[0]?.camera.split('/')[5], 10) ?? null,
        location: parseInt(data[0]?.location.split('/')[5], 10) ?? null,
        parts: data[0]?.parts.map((ele) => parseInt(ele.split('/')[5], 10)) ?? [],
        modelUrl: data[0]?.download_uri ?? '',
        needRetraining: data[0]?.needRetraining ?? true,
        accuracyRangeMin: data[0]?.accuracyRangeMin ?? 60,
        accuracyRangeMax: data[0]?.accuracyRangeMax ?? 80,
        maxImages: data[0]?.maxImages ?? 50,
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
): ProjectThunk => (dispatch, getState): Promise<number> => {
  const isProjectEmpty = projectId === null;
  const url = isProjectEmpty ? `/api/projects/` : `/api/projects/${projectId}/`;

  dispatch(postProjectRequest());

  const projectData = getState().project.data;

  return Axios(url, {
    data: {
      location: `http://localhost:8000/api/locations/${selectedLocations.id}/`,
      parts: selectedParts.map((e) => `http://localhost:8000/api/parts/${e.id}/`),
      camera: `http://localhost:8000/api/cameras/${selectedCamera.id}/`,
      download_uri: projectData.modelUrl,
      needRetraining: projectData.needRetraining,
      accuracyRangeMin: projectData.accuracyRangeMin,
      accuracyRangeMax: projectData.accuracyRangeMax,
      maxImages: projectData.maxImages,
    },
    method: isProjectEmpty ? 'POST' : 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(({ data }) => {
      dispatch(postProjectSuccess());
      getTrain(data.id);
      return data.id;
    })
    .catch((err) => {
      dispatch(postProjectFail(err));
    }) as Promise<number>;
};
const getTrain = (projectId): void => {
  Axios.get(`/api/projects/${projectId}/train`).catch((err) => console.error(err));
};

export const thunkDeleteProject = (projectId): ProjectThunk => (dispatch): Promise<any> => {
  return Axios.delete(`/api/projects/${projectId}/`)
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
      else if (data.status === 'ok') dispatch(getTrainingLogSuccess('', Status.FinishTraining));
      else dispatch(getTrainingLogSuccess(data.log, Status.WaitTraining));
      return void 0;
    })
    .catch((err) => dispatch(getTrainingStatusFailed(err)));
};

export const thunkGetTrainingMetric = (projectId: number) => (dispacth): Promise<any> => {
  dispacth(getTrainingMetricRequest());

  return Axios.get(`/api/projects/${projectId}/train_performance`)
    .then(({ data }) => {
      const curConsequence: Consequence = data.new
        ? {
            precision: data.new.precision * 100,
            recall: data.new.recall * 100,
            mAP: data.new.map * 100,
          }
        : null;

      const prevConsequence: Consequence = data.previous
        ? {
            precision: data.previous.precision * 100,
            recall: data.previous.recall * 100,
            mAP: data.previous.map * 100,
          }
        : null;

      return dispacth(getTrainingMetricSuccess(curConsequence, prevConsequence));
    })
    .catch((err) => dispacth(getTrainingMetricFailed(err)));
};

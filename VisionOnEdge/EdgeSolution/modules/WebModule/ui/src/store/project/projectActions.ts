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
  GetTrainingStatusRequesAction,
  GET_TRAINING_STATUS_REQUEST,
  GetTrainingStatusSuccessAction,
  GET_TRAINING_STATUS_SUCCESS,
  GetTrainingStatusFailedAction,
  GET_TRAINING_STATUS_FAILED,
  Consequence,
} from './projectTypes';

const getProjectRequest = (): GetProjectRequestAction => ({ type: GET_PROJECT_REQUEST });
const getProjectSuccess = (project: ProjectData): GetProjectSuccessAction => ({
  type: GET_PROJECT_SUCCESS,
  payload: { project },
});
const getProjectFailed = (error: Error): GetProjectFailedAction => ({ type: GET_PROJECT_FAILED, error });

const getTrainingStatusRequest = (): GetTrainingStatusRequesAction => ({ type: GET_TRAINING_STATUS_REQUEST });
const getTrainingStatusSuccess = (
  trainingLog: string,
  modelUrl?: string,
  successRate?: number,
  successfulInferences?: number,
  unIdetifiedItems?: number,
  curConsequence?: Consequence,
  prevConsequence?: Consequence,
): GetTrainingStatusSuccessAction => ({
  type: GET_TRAINING_STATUS_SUCCESS,
  payload: {
    trainingLog,
    modelUrl,
    successRate,
    successfulInferences,
    unIdetifiedItems,
    curConsequence,
    prevConsequence,
  },
});
const getTrainingStatusFailed = (error: Error): GetTrainingStatusFailedAction => ({
  type: GET_TRAINING_STATUS_FAILED,
  error,
});

const postProjectRequest = (): PostProjectRequestAction => ({ type: POST_PROJECT_REQUEST });
const postProjectSuccess = (): PostProjectSuccessAction => ({ type: POST_PROJECT_SUCCESS });
const postProjectFail = (error: Error): PostProjectFaliedAction => ({ type: POST_PROJECT_FALIED, error });

const deleteProjectSuccess = (): DeleteProjectSuccessAction => ({ type: DELETE_PROJECT_SUCCESS });
const deleteProjectFailed = (): DeleteProjectFaliedAction => ({ type: DELETE_PROJECT_FALIED });

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
        status: data[0]?.status ?? 'online',
        needRetraining: data[0]?.needRetraining ?? true,
        accuracyRangeMin: data[0]?.accuracyRangeMin ?? 60,
        accuracyRangeMax: data[0]?.accuracyRangeMax ?? 80,
        maxImages: data[0]?.maxImages ?? 50,
        successRate: data[0]?.successRate ?? 0,
        successfulInferences: data[0]?.successfulInferences ?? 0,
        unIdetifiedItems: data[0]?.unIdetifiedItems ?? 0,
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

export const thunkGetTrainingStatus = (projectId: number) => (dispatch): Promise<any> => {
  dispatch(getTrainingStatusRequest());

  const exportAPI = Axios.get(`/api/projects/${projectId}/export`);
  const performanceAPI = Axios.get(`/api/projects/${projectId}/train_performance`);

  return Axios.all([exportAPI, performanceAPI])
    .then(
      Axios.spread((...responses) => {
        const { data: exportData } = responses[0];
        const { data: performanceData } = responses[1];
        if (exportData.status === 'failed') throw new Error(exportData.log);
        else if (exportData.status === 'ok') {
          const prevConsequences: Consequence = {
            precision: performanceData?.previous?.precision * 100,
            recall: performanceData?.previous?.recall * 100,
            mAP: performanceData?.previous?.map * 100,
          };

          const curConsequences: Consequence = {
            precision: performanceData?.new?.precision * 100,
            recall: performanceData?.new?.recall * 100,
            mAP: performanceData?.new?.map * 100,
          };

          dispatch(
            getTrainingStatusSuccess(
              '',
              exportData.download_uri,
              exportData.success_rate,
              exportData.inference_num,
              exportData.unidentified_num,
              prevConsequences,
              curConsequences,
            ),
          );
        } else dispatch(getTrainingStatusSuccess(exportData.log));
        return void 0;
      }),
    )
    .catch((err) => dispatch(getTrainingStatusFailed(err)));
};

const getTrain = (projectId): void => {
  Axios.get(`/api/projects/${projectId}/train`).catch((err) => console.error(err));
};

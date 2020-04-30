import Axios from 'axios';
import {
  ProjectThunk,
  GetProjectSuccessAction,
  GET_PROJECT_SUCCESS,
  Project,
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
} from './projectTypes';

const getProjectRequest = (): GetProjectRequestAction => ({ type: GET_PROJECT_REQUEST });
const getProjectSuccess = (project: ProjectData): GetProjectSuccessAction => ({
  type: GET_PROJECT_SUCCESS,
  payload: { project },
});
const getProjectFailed = (error: Error): GetProjectFailedAction => ({ type: GET_PROJECT_FAILED, error });

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
        status: data[0]?.status ?? 'offline',
        needRetraining: data[0]?.needRetraining ?? true,
        accuracyRangeMin: data[0]?.accuracyRangeMin ?? 60,
        accuracyRangeMax: data[0]?.accuracyRangeMax ?? 80,
        maxImages: data[0]?.maxImage ?? 50,
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

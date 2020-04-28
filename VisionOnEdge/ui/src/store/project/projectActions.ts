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
} from './projectTypes';

const getProjectSuccess = (project: ProjectData): GetProjectSuccessAction => ({
  type: GET_PROJECT_SUCCESS,
  payload: { project },
});

const getProjectFailed = (error: Error): GetProjectFailedAction => ({ type: GET_PROJECT_FAILED, error });

const postProjectSuccess = (): PostProjectSuccessAction => ({ type: POST_PROJECT_SUCCESS });

const postProjectFail = (): PostProjectFaliedAction => ({ type: POST_PROJECT_FALIED });

const deleteProjectSuccess = (): DeleteProjectSuccessAction => ({ type: DELETE_PROJECT_SUCCESS });

const deleteProjectFailed = (): DeleteProjectFaliedAction => ({
  type: DELETE_PROJECT_FALIED,
});

export const thunkGetProject = (): ProjectThunk => (dispatch): Promise<void> => {
  return Axios.get('/api/projects/')
    .then(({ data }) => {
      const project: ProjectData = {
        id: data[0]?.id ?? null,
        camera: parseInt(data[0]?.camera.split('/')[5], 10) ?? null,
        location: parseInt(data[0]?.location.split('/')[5], 10) ?? null,
        parts: data[0]?.parts.map((ele) => parseInt(ele.split('/')[5], 10)) ?? [],
        modelUrl: data[0]?.training_uri ?? '',
        status: data[0]?.status ?? 'offline',
        successRate: data[0]?.successRate ?? 0,
        successfulInferences: data[0]?.successfulInferences ?? 0,
        unIdetifiedItems: data[0]?.unIdetifiedItems ?? 0,
      };
      dispatch(getProjectSuccess(project));
      return void 0;
    })
    .catch((err) => {
      console.error(err);
      dispatch(getProjectFailed(err));
    });
};

export const thunkPostProject = (
  projectId,
  selectedLocations,
  selectedParts,
  selectedCamera,
): ProjectThunk => (dispatch): Promise<number> => {
  const isProjectEmpty = projectId === null;
  const url = isProjectEmpty ? `/api/projects/` : `/api/projects/${projectId}/`;

  return Axios(url, {
    data: {
      location: `http://localhost:8000/api/locations/${selectedLocations.id}/`,
      parts: selectedParts.map((e) => `http://localhost:8000/api/parts/${e.id}/`),
      camera: `http://localhost:8000/api/cameras/${selectedCamera.id}/`,
      download_uri: '',
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
      dispatch(postProjectFail());
      console.error(err);
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

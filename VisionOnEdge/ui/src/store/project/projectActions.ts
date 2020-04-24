import Axios from 'axios';
import {
  ProjectThunk,
  GetProjectSuccessAction,
  GET_PROJECT_SUCCESS,
  Project,
  GetProjectFailedAction,
  GET_PROJECT_FAILED,
} from './projectTypes';

const getProjectSuccess = (project: Project): GetProjectSuccessAction => ({
  type: GET_PROJECT_SUCCESS,
  payload: { project },
});

const getProjectFailed = (): GetProjectFailedAction => ({ type: GET_PROJECT_FAILED });

export const thunkGetProject = (): ProjectThunk => (dispatch): Promise<void> => {
  return Axios.get('/api/projects/')
    .then(({ data }) => {
      const project: Project = {
        id: data[0]?.id || null,
        camera: data[0]?.camera || null,
        location: data[0]?.location || null,
        parts: data[0]?.parts || [],
        modelUrl: data[0]?.training_uri || '',
      };
      dispatch(getProjectSuccess(project));
      return void 0;
    })
    .catch((err) => {
      console.error(err);
      dispatch(getProjectFailed());
    });
};

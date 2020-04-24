import { initialState } from '../State';
import {
  Project,
  ProjectActionTypes,
  GET_PROJECT_SUCCESS,
  GET_PROJECT_FAILED,
  POST_PROJECT_SUCCESS,
  POST_PROJECT_FALIED,
  DELETE_PROJECT_SUCCESS,
  DELETE_PROJECT_FALIED,
} from './projectTypes';

const projectReducer = (state = initialState.project, action: ProjectActionTypes): Project => {
  switch (action.type) {
    case GET_PROJECT_SUCCESS:
      return { ...action.payload.project };
    case GET_PROJECT_FAILED:
      return { ...state };
    case POST_PROJECT_SUCCESS:
      return { ...state };
    case POST_PROJECT_FALIED:
      return { ...state };
    case DELETE_PROJECT_SUCCESS:
      return {
        id: null,
        camera: null,
        location: null,
        parts: [],
        modelUrl: '',
        status: '',
        successRate: null,
        successfulInferences: null,
        unIdetifiedItems: null,
      };
    case DELETE_PROJECT_FALIED:
      return { ...state };
    default:
      return { ...state };
  }
};

export default projectReducer;

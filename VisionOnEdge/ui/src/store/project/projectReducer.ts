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
  GET_PROJECT_REQUEST,
} from './projectTypes';

const projectReducer = (state = initialState.project, action: ProjectActionTypes): Project => {
  switch (action.type) {
    case GET_PROJECT_REQUEST:
      return { ...state, status: 'pending', error: null };
    case GET_PROJECT_SUCCESS:
      return { status: 'resolved', data: { ...action.payload.project }, error: null };
    case GET_PROJECT_FAILED:
      return { ...state };
    case POST_PROJECT_SUCCESS:
      return { ...state };
    case POST_PROJECT_FALIED:
      return { ...state };
    case DELETE_PROJECT_SUCCESS:
      return {
        status: 'resolved',
        data: {
          id: null,
          camera: null,
          location: null,
          parts: [],
          modelUrl: '',
          status: '',
          successRate: null,
          successfulInferences: null,
          unIdetifiedItems: null,
        },
        error: null,
      };
    case DELETE_PROJECT_FALIED:
      return { ...state };
    default:
      return { ...state };
  }
};

export default projectReducer;

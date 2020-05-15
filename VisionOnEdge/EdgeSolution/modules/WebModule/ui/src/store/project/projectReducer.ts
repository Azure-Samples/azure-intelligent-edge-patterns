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
  UPDATE_PROJECT_DATA,
  POST_PROJECT_REQUEST,
  GET_TRAINING_LOG_REQUEST,
  GET_TRAINING_LOG_SUCCESS,
  GET_TRAINING_LOG_FAILED,
  Status,
} from './projectTypes';

const projectReducer = (state = initialState.project, action: ProjectActionTypes): Project => {
  switch (action.type) {
    case GET_PROJECT_REQUEST:
      return { ...state, isLoading: true, error: null };
    case GET_PROJECT_SUCCESS:
      return { ...state, isLoading: false, data: { ...action.payload.project }, error: null };
    case GET_PROJECT_FAILED:
      return { ...state, isLoading: false, error: action.error };
    case POST_PROJECT_REQUEST:
      return { ...state, isLoading: true };
    case POST_PROJECT_SUCCESS:
      return { ...state, isLoading: false };
    case POST_PROJECT_FALIED:
      return { ...state, isLoading: false, error: action.error };
    case DELETE_PROJECT_SUCCESS:
      return {
        ...state,
        isLoading: false,
        data: {
          id: null,
          camera: null,
          location: null,
          parts: [],
          needRetraining: true,
          accuracyRangeMin: 60,
          accuracyRangeMax: 80,
          maxImages: 50,
          modelUrl: '',
        },
        inferenceMetric: {
          successRate: 0,
          successfulInferences: 0,
          unIdetifiedItems: 0,
        },
        trainingMetric: {
          curConsequence: null,
          prevConsequence: null,
        },
        trainingLog: '',
        status: Status.None,
        error: null,
      };
    case DELETE_PROJECT_FALIED:
      return { ...state };
    case UPDATE_PROJECT_DATA:
      return { ...state, data: action.payload };
    case GET_TRAINING_LOG_REQUEST:
      return {
        ...state,
      };
    case GET_TRAINING_LOG_SUCCESS:
      return {
        ...state,
        trainingLog: action.payload.trainingLog,
        status: action.payload.newStatus,
      };
    case GET_TRAINING_LOG_FAILED:
      return {
        ...state,
        trainingLog: '',
        data: { ...state.data },
        status: Status.TrainingFailed,
        error: action.error,
      };
    default:
      return { ...state };
  }
};

export default projectReducer;

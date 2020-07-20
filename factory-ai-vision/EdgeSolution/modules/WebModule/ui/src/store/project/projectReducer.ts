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
  GET_TRAINING_METRICS_REQUEST,
  GET_TRAINING_METRICS_SUCCESS,
  GET_TRAINING_METRICS_FAILED,
  GET_INFERENCE_METRICS_REQUEST,
  GET_INFERENCE_METRICS_SUCCESS,
  GET_INFERENCE_METRICS_FAILED,
  UPDATE_ORIGIN_PROJECT_DATA,
} from './projectTypes';

const getStatusAfterGetProject = (status: Status, hasConfigured: boolean): Status => {
  if (hasConfigured && status === Status.None) return Status.WaitTraining;
  if (hasConfigured) return status;
  return Status.None;
};

/**
 * Share this reducer between project and demoProject
 * Check the `isDemo` property in action to check if it is right reducer
 * @param isDemo
 */
const createProjectReducerByIsDemo = (isDemo: boolean) => (
  state = initialState.project,
  action: ProjectActionTypes,
): Project => {
  if (isDemo !== action.isDemo) return state;

  switch (action.type) {
    case GET_PROJECT_REQUEST:
      return { ...state, isLoading: true, error: null };
    case GET_PROJECT_SUCCESS:
      return {
        ...state,
        isLoading: false,
        data: { ...action.payload.project },
        originData: { ...action.payload.project },
        // If the project has configured, set status to wait training so it will start calling export and get the latest status
        status: getStatusAfterGetProject(state.status, action.payload.hasConfigured),
        error: null,
      };
    case GET_PROJECT_FAILED:
      return { ...state, isLoading: false, error: action.error };
    case POST_PROJECT_REQUEST:
      return { ...state, isLoading: true };
    case POST_PROJECT_SUCCESS:
      return { ...state, isLoading: false, data: action.data, originData: action.data };
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
          sendMessageToCloud: false,
          framesPerMin: 6,
          accuracyThreshold: 50,
          probThreshold: '10',
        },
        originData: {
          id: null,
          camera: null,
          location: null,
          parts: [],
          needRetraining: true,
          accuracyRangeMin: 60,
          accuracyRangeMax: 80,
          maxImages: 50,
          modelUrl: '',
          sendMessageToCloud: false,
          framesPerMin: 6,
          accuracyThreshold: 50,
          probThreshold: '10',
        },
        inferenceMetrics: {
          successRate: 0,
          successfulInferences: 0,
          unIdetifiedItems: 0,
          isGpu: false,
          averageTime: 0,
        },
        trainingMetrics: {
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
      return { ...state, data: { ...state.data, ...action.payload } };
    case UPDATE_ORIGIN_PROJECT_DATA:
      return { ...state, originData: state.data };
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
    case GET_TRAINING_METRICS_REQUEST:
      return state;
    case GET_TRAINING_METRICS_SUCCESS:
      return {
        ...state,
        trainingMetrics: action.payload,
        status: Status.StartInference,
      };
    case GET_TRAINING_METRICS_FAILED:
      return {
        ...state,
        error: action.error,
      };
    case GET_INFERENCE_METRICS_REQUEST:
      return state;
    case GET_INFERENCE_METRICS_SUCCESS:
      return { ...state, inferenceMetrics: action.payload };
    case GET_INFERENCE_METRICS_FAILED:
      return { ...state, error: action.error };
    case 'CHANGE_STATUS':
      return { ...state, status: action.status };
    case 'UPDATE_PROB_THRESHOLD_REQUEST':
      return { ...state, isLoading: true, error: null };
    case 'UPDATE_PROB_THRESHOLD_SUCCESS':
      return { ...state, isLoading: false };
    case 'UPDATE_PROB_THRESHOLD_FAILED':
      return { ...state, isLoading: false, error: action.error };
    default:
      return { ...state };
  }
};

export default createProjectReducerByIsDemo;

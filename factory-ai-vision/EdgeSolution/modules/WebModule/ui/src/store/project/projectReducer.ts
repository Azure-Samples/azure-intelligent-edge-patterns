import * as R from 'ramda';
import {
  Project,
  ProjectActionTypes,
  GET_PROJECT_SUCCESS,
  GET_PROJECT_FAILED,
  POST_PROJECT_SUCCESS,
  POST_PROJECT_FALIED,
  GET_PROJECT_REQUEST,
  UPDATE_PROJECT_DATA,
  POST_PROJECT_REQUEST,
  Status,
  ProjectData,
  InferenceMode,
  InferenceProtocol,
  InferenceSource,
  TRAIN_SUCCESS,
  TRAIN_FAILED,
} from './projectTypes';
import { getConfigure, updateProbThreshold } from './projectActions';
import { pullCVProjects } from '../trainingProjectSlice';

const getStatusAfterGetProject = (status: Status, hasConfigured: boolean): Status => {
  if (hasConfigured && status === Status.None) return Status.WaitTraining;
  if (hasConfigured) return status;
  return Status.None;
};

export const initialProjectData: ProjectData = {
  id: null,
  cameras: [],
  parts: [],
  trainingProject: null,
  needRetraining: true,
  accuracyRangeMin: 60,
  accuracyRangeMax: 80,
  maxImages: 20,
  sendMessageToCloud: false,
  framesPerMin: 6,
  probThreshold: 60,
  name: '',
  SVTCcameras: [],
  SVTCisOpen: false,
  SVTCparts: [],
  SVTCconfirmationThreshold: 60,
  SVTCRecordingDuration: 1,
  SVTCEnableTracking: false,
  inferenceMode: InferenceMode.PartDetection,
  deployTimeStamp: '',
  setFpsManually: false,
  fps: '10.0',
  recomendedFps: 10,
  totalRecomendedFps: 10,
  inferenceProtocol: InferenceProtocol.GRPC,
  inferenceSource: InferenceSource.LVA,
  disableVideoFeed: false,
};

const initialState: Project = {
  isLoading: false,
  data: initialProjectData,
  originData: initialProjectData,
  status: Status.None,
  error: null,
};

const projectReducer = (state = initialState, action: ProjectActionTypes): Project => {
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
      return {
        ...state,
        isLoading: false,
        data: action.data,
        originData: action.data,
      };
    case POST_PROJECT_FALIED:
      return { ...state, isLoading: false, error: action.error };
    case getConfigure.fulfilled.toString():
      return { ...state, status: Status.WaitTraining };
    case UPDATE_PROJECT_DATA:
      return { ...state, data: { ...state.data, ...action.payload } };
    case pullCVProjects.fulfilled.toString():
      return { ...state, originData: state.data };
    case TRAIN_SUCCESS: {
      return {
        ...state,
        status: Status.StartInference,
      };
    }
    case TRAIN_FAILED:
      return {
        ...state,
        status: Status.TrainingFailed,
      };
    case updateProbThreshold.pending.toString():
      return { ...state, isLoading: true, error: null };
    case updateProbThreshold.fulfilled.toString():
      return { ...state, isLoading: false, originData: R.clone(state.data) };
    case updateProbThreshold.rejected.toString():
      return { ...state, isLoading: false };
    default:
      return { ...state };
  }
};

export default projectReducer;

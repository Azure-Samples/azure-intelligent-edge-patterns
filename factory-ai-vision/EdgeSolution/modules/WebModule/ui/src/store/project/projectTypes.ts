import { ThunkAction } from 'redux-thunk';
import { Action } from 'redux';
import type { State } from '../State';

export type Project = {
  isLoading: boolean;
  trainingLog: string;
  data: ProjectData;
  originData: ProjectData;
  inferenceMetrics: {
    successRate: number;
    successfulInferences: number;
    unIdetifiedItems: number;
    isGpu: boolean;
    averageTime: number;
  };
  trainingMetrics: TrainingMetrics;
  status: Status;
  error: Error;
};

export type TrainingMetrics = {
  prevConsequence: Consequence;
  curConsequence: Consequence;
};

export enum Status {
  None = 'none',
  WaitTraining = 'waitTraining',
  FinishTraining = 'finishTraining',
  TrainingFailed = 'trainingFailed',
  StartInference = 'startInference',
}

export type Consequence = {
  precision: number;
  recall: number;
  mAP: number;
};

export type ProjectData = {
  id: number;
  camera: any;
  location: any;
  parts: any[];
  needRetraining: boolean;
  accuracyRangeMin: number;
  accuracyRangeMax: number;
  maxImages: number;
  sendMessageToCloud: boolean;
  framesPerMin: number;
  accuracyThreshold: number;
  modelUrl: string;
  cvProjectId?: string;
  // use text input brings a better UX, so we set it to string here
  probThreshold: string;
};

// Describing the different ACTION NAMES available
type ProjectAction = {
  isDemo: boolean;
};
// FIXME Replace constant with string
export const GET_PROJECT_REQUEST = 'GET_PROJECT_REQUEST';
export type GetProjectRequestAction = ProjectAction & {
  type: typeof GET_PROJECT_REQUEST;
};

export const GET_PROJECT_SUCCESS = 'GET_PROJECT_SUCCESS';
export type GetProjectSuccessAction = ProjectAction & {
  type: typeof GET_PROJECT_SUCCESS;
  payload: {
    project: ProjectData;
    hasConfigured: boolean;
  };
};

export const GET_PROJECT_FAILED = 'GET_PROJECT_FAILED';
export type GetProjectFailedAction = ProjectAction & {
  type: typeof GET_PROJECT_FAILED;
  error: Error;
};

export const GET_TRAINING_LOG_REQUEST = 'GET_TRAINING_LOG_REQUEST';
export type GetTrainingLogRequesAction = ProjectAction & {
  type: typeof GET_TRAINING_LOG_REQUEST;
};

export const GET_TRAINING_LOG_SUCCESS = 'GET_TRAINING_LOG_SUCCESS';
export type GetTrainingLogSuccessAction = ProjectAction & {
  type: typeof GET_TRAINING_LOG_SUCCESS;
  payload: {
    trainingLog: string;
    newStatus: Status;
  };
};

export const GET_TRAINING_LOG_FAILED = 'GET_TRAINING_LOG_FAILED';
export type GetTrainingLogFailedAction = ProjectAction & {
  type: typeof GET_TRAINING_LOG_FAILED;
  error: Error;
};

export const GET_TRAINING_METRICS_REQUEST = 'GET_TRAINING_METRICS_REQUEST';
export type GetTrainingMetricsRequestAction = ProjectAction & {
  type: typeof GET_TRAINING_METRICS_REQUEST;
};

export const GET_TRAINING_METRICS_SUCCESS = 'GET_TRAINING_METRICS_SUCCESS';
export type GetTrainingMetricsSuccessAction = ProjectAction & {
  type: typeof GET_TRAINING_METRICS_SUCCESS;
  payload: {
    prevConsequence: Consequence;
    curConsequence: Consequence;
  };
};

export const GET_TRAINING_METRICS_FAILED = 'GET_TRAINING_METRICS_FAILED';
export type GetTrainingMetricsFailedAction = ProjectAction & {
  type: typeof GET_TRAINING_METRICS_FAILED;
  error: Error;
};

export const GET_INFERENCE_METRICS_REQUEST = 'GET_TRAINING_INFERENCE_REQUEST';
export type GetInferenceMetricsRequestAction = ProjectAction & {
  type: typeof GET_INFERENCE_METRICS_REQUEST;
};

export const GET_INFERENCE_METRICS_SUCCESS = 'GET_INFERENCE_METRICS_SUCCESS';
export type GetInferenceMetricsSuccessAction = ProjectAction & {
  type: typeof GET_INFERENCE_METRICS_SUCCESS;
  payload: {
    successRate: number;
    successfulInferences: number;
    unIdetifiedItems: number;
    isGpu: boolean;
    averageTime: number;
  };
};

export const GET_INFERENCE_METRICS_FAILED = 'GET_INFERENCE_METRICS_FAILED';
export type GetInferenceMetricsFailedAction = ProjectAction & {
  type: typeof GET_INFERENCE_METRICS_FAILED;
  error: Error;
};

export const POST_PROJECT_REQUEST = 'POST_PROJECT_REQUEST';
export type PostProjectRequestAction = ProjectAction & {
  type: typeof POST_PROJECT_REQUEST;
};

export const POST_PROJECT_SUCCESS = 'POST_PROJECT_SUCCESS';
export type PostProjectSuccessAction = ProjectAction & {
  type: typeof POST_PROJECT_SUCCESS;
  data: ProjectData;
};

export const POST_PROJECT_FALIED = 'POST_PROJECT_FALIED';
export type PostProjectFaliedAction = ProjectAction & {
  type: typeof POST_PROJECT_FALIED;
  error: Error;
};

export const DELETE_PROJECT_SUCCESS = 'DELETE_PROJECT_SUCCESS';
export type DeleteProjectSuccessAction = ProjectAction & {
  type: typeof DELETE_PROJECT_SUCCESS;
};

export const DELETE_PROJECT_FALIED = 'DELETE_PROJECT_FALIED';
export type DeleteProjectFaliedAction = ProjectAction & {
  type: typeof DELETE_PROJECT_FALIED;
};

export const UPDATE_PROJECT_DATA = 'UPDATE_PROJECT_DATA';
export type UpdateProjectDataAction = ProjectAction & {
  type: typeof UPDATE_PROJECT_DATA;
  payload: Partial<ProjectData>;
};

export const UPDATE_ORIGIN_PROJECT_DATA = 'UPDATE_ORIGIN_PROJECT_DATA';
export type UpdateOriginProjectDataAction = ProjectAction & {
  type: typeof UPDATE_ORIGIN_PROJECT_DATA;
};

export const START_INFERENCE = 'START_INFERENCE';
export type StartInferenceAction = ProjectAction & {
  type: typeof START_INFERENCE;
};

export const STOP_INFERENCE = 'STOP_INFERENCE';
export type StopInferenceAction = ProjectAction & {
  type: typeof STOP_INFERENCE;
};

export type ChangeStatusAction = ProjectAction & {
  type: 'CHANGE_STATUS';
  status: Status;
};

export type UpdateProbThresholdRequestAction = ProjectAction & {
  type: 'UPDATE_PROB_THRESHOLD_REQUEST';
};

export type UpdateProbThresholdSuccessAction = ProjectAction & {
  type: 'UPDATE_PROB_THRESHOLD_SUCCESS';
};

export type UpdateProbThresholdFailedAction = ProjectAction & {
  type: 'UPDATE_PROB_THRESHOLD_FAILED';
  error: Error;
};

export type ProjectActionTypes =
  | GetProjectRequestAction
  | GetProjectSuccessAction
  | GetProjectFailedAction
  | GetTrainingLogRequesAction
  | GetTrainingLogSuccessAction
  | GetTrainingLogFailedAction
  | PostProjectRequestAction
  | PostProjectSuccessAction
  | PostProjectFaliedAction
  | DeleteProjectSuccessAction
  | DeleteProjectFaliedAction
  | UpdateProjectDataAction
  | UpdateOriginProjectDataAction
  | GetTrainingMetricsRequestAction
  | GetTrainingMetricsSuccessAction
  | GetTrainingMetricsFailedAction
  | GetInferenceMetricsRequestAction
  | GetInferenceMetricsSuccessAction
  | GetInferenceMetricsFailedAction
  | StartInferenceAction
  | StopInferenceAction
  | ChangeStatusAction
  | UpdateProbThresholdRequestAction
  | UpdateProbThresholdSuccessAction
  | UpdateProbThresholdFailedAction;

// Describing the different THUNK ACTION NAMES available
export type ProjectThunk<ReturnType = void> = ThunkAction<ReturnType, State, unknown, Action<string>>;

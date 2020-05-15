import { ThunkAction } from 'redux-thunk';
import { Action } from 'redux';
import type { State } from '../State';

export type Project = {
  isLoading: boolean;
  trainingLog: string;
  data: ProjectData;
  inferenceMetric: {
    successRate: number;
    successfulInferences: number;
    unIdetifiedItems: number;
  };
  trainingMetric: {
    prevConsequence: Consequence;
    curConsequence: Consequence;
  };
  status: Status;
  error: Error;
};

export enum Status {
  None = 'none',
  WaitTraining = 'waitTraining',
  FinishTraining = 'finishTraining',
  TrainingFailed = 'trainingFailed',
  StartInference = 'startInference',
  PendInference = 'pendInference',
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
  modelUrl: string;
};

// Describing the different ACTION NAMES available
export const GET_PROJECT_REQUEST = 'GET_PROJECT_REQUEST';
export type GetProjectRequestAction = {
  type: typeof GET_PROJECT_REQUEST;
};

export const GET_PROJECT_SUCCESS = 'GET_PROJECT_SUCCESS';
export type GetProjectSuccessAction = {
  type: typeof GET_PROJECT_SUCCESS;
  payload: {
    project: ProjectData;
  };
};

export const GET_PROJECT_FAILED = 'GET_PROJECT_FAILED';
export type GetProjectFailedAction = {
  type: typeof GET_PROJECT_FAILED;
  error: Error;
};

export const GET_TRAINING_LOG_REQUEST = 'GET_TRAINING_LOG_REQUEST';
export type GetTrainingLogRequesAction = {
  type: typeof GET_TRAINING_LOG_REQUEST;
};

export const GET_TRAINING_LOG_SUCCESS = 'GET_TRAINING_LOG_SUCCESS';
export type GetTrainingLogSuccessAction = {
  type: typeof GET_TRAINING_LOG_SUCCESS;
  payload: {
    trainingLog: string;
    newStatus: Status;
  };
};

export const GET_TRAINING_LOG_FAILED = 'GET_TRAINING_LOG_FAILED';
export type GetTrainingLogFailedAction = {
  type: typeof GET_TRAINING_LOG_FAILED;
  error: Error;
};

export const GET_TRAINING_METRICS_REQUEST = 'GET_TRAINING_METRICS_REQUEST';
export type GetTrainingMetricsRequestAction = {
  type: typeof GET_TRAINING_METRICS_REQUEST;
};

export const GET_TRAINING_METRICS_SUCCESS = 'GET_TRAINING_METRICS_SUCCESS';
export type GetTrainingMetricsSuccessAction = {
  type: typeof GET_TRAINING_METRICS_SUCCESS;
  payload: {
    prevConsequence: Consequence;
    curConsequence: Consequence;
  };
};

export const GET_TRAINING_METRICS_FAILED = 'GET_TRAINING_METRICS_FAILED';
export type GetTrainingMetricsFailedAction = {
  type: typeof GET_TRAINING_METRICS_FAILED;
  error: Error;
};

export const GET_INFERENCE_METRICS_REQUEST = 'GET_TRAINING_INFERENCE_REQUEST';
export type GetInferenceMetricsRequestAction = {
  type: typeof GET_INFERENCE_METRICS_REQUEST;
};

export const GET_INFERENCE_METRICS_SUCCESS = 'GET_INFERENCE_METRICS_SUCCESS';
export type GetInferenceMetricsSuccessAction = {
  type: typeof GET_INFERENCE_METRICS_SUCCESS;
  payload: {
    successRate: number;
    successfulInferences: number;
    unIdetifiedItems: number;
  };
};

export const GET_INFERENCE_METRICS_FAILED = 'GET_INFERENCE_METRICS_FAILED';
export type GetInferenceMetricsFailedAction = {
  type: typeof GET_INFERENCE_METRICS_FAILED;
  error: Error;
};

export const POST_PROJECT_REQUEST = 'POST_PROJECT_REQUEST';
export type PostProjectRequestAction = {
  type: typeof POST_PROJECT_REQUEST;
};

export const POST_PROJECT_SUCCESS = 'POST_PROJECT_SUCCESS';
export type PostProjectSuccessAction = {
  type: typeof POST_PROJECT_SUCCESS;
};

export const POST_PROJECT_FALIED = 'POST_PROJECT_FALIED';
export type PostProjectFaliedAction = {
  type: typeof POST_PROJECT_FALIED;
  error: Error;
};

export const DELETE_PROJECT_SUCCESS = 'DELETE_PROJECT_SUCCESS';
export type DeleteProjectSuccessAction = {
  type: typeof DELETE_PROJECT_SUCCESS;
};

export const DELETE_PROJECT_FALIED = 'DELETE_PROJECT_FALIED';
export type DeleteProjectFaliedAction = {
  type: typeof DELETE_PROJECT_FALIED;
};

export const UPDATE_PROJECT_DATA = 'UPDATE_PROJECT_DATA';
export type UpdateProjectDataAction = {
  type: typeof UPDATE_PROJECT_DATA;
  payload: ProjectData;
};

export const START_INFERENCE = 'START_INFERENCE';
export type StartInferenceAction = {
  type: typeof START_INFERENCE;
};

export const STOP_INFERENCE = 'STOP_INFERENCE';
export type StopInferenceAction = {
  type: typeof STOP_INFERENCE;
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
  | GetTrainingMetricsRequestAction
  | GetTrainingMetricsSuccessAction
  | GetTrainingMetricsFailedAction
  | GetInferenceMetricsRequestAction
  | GetInferenceMetricsSuccessAction
  | GetInferenceMetricsFailedAction
  | StartInferenceAction
  | StopInferenceAction;

// Describing the different THUNK ACTION NAMES available
export type ProjectThunk<ReturnType = void> = ThunkAction<ReturnType, State, unknown, Action<string>>;

/* eslint-disable @typescript-eslint/camelcase */
import Axios from 'axios';
import * as R from 'ramda';
import { State } from 'RootStateType';
import {
  ProjectThunk,
  GetProjectSuccessAction,
  GET_PROJECT_SUCCESS,
  GetProjectFailedAction,
  GET_PROJECT_FAILED,
  PostProjectSuccessAction,
  POST_PROJECT_SUCCESS,
  POST_PROJECT_FALIED,
  PostProjectFaliedAction,
  ProjectData,
  PostProjectRequestAction,
  POST_PROJECT_REQUEST,
  GetProjectRequestAction,
  GET_PROJECT_REQUEST,
  UpdateProjectDataAction,
  UPDATE_PROJECT_DATA,
  Status,
  GetTrainingMetricsRequestAction,
  GET_TRAINING_METRICS_REQUEST,
  GetTrainingMetricsSuccessAction,
  GET_TRAINING_METRICS_SUCCESS,
  GetTrainingMetricsFailedAction,
  GET_TRAINING_METRICS_FAILED,
  Consequence,
  StartInferenceAction,
  START_INFERENCE,
  STOP_INFERENCE,
  StopInferenceAction,
  ChangeStatusAction,
  InferenceProtocol,
  InferenceSource,
  TrainSuccessAction,
  TRAIN_SUCCESS,
  TrainFailedAction,
  TRAIN_FAILED,
} from './projectTypes';
import { selectAllImages } from '../imageSlice';
import { createWrappedAsync } from '../shared/createWrappedAsync';

const getProjectRequest = (isDemo: boolean): GetProjectRequestAction => ({
  type: GET_PROJECT_REQUEST,
  isDemo,
});
export const getProjectSuccess = (
  project: ProjectData,
  hasConfigured: boolean,
  isDemo: boolean,
): GetProjectSuccessAction => ({
  type: GET_PROJECT_SUCCESS,
  payload: { project, hasConfigured },
  isDemo,
});
const getProjectFailed = (error: Error, isDemo: boolean): GetProjectFailedAction => ({
  type: GET_PROJECT_FAILED,
  error,
  isDemo,
});

const postProjectRequest = (isDemo: boolean): PostProjectRequestAction => ({
  type: POST_PROJECT_REQUEST,
  isDemo,
});
const postProjectSuccess = (data: any, isDemo: boolean): PostProjectSuccessAction => ({
  type: POST_PROJECT_SUCCESS,
  data: {
    id: data?.id ?? null,
    cameras: data?.cameras ?? [],
    location: data?.location ?? null,
    parts: data?.parts ?? [],
    trainingProject: data?.project ?? null,
    modelUrl: data?.download_uri ?? '',
    needRetraining: data?.needRetraining ?? true,
    accuracyRangeMin: data?.accuracyRangeMin ?? 60,
    accuracyRangeMax: data?.accuracyRangeMax ?? 80,
    maxImages: data?.maxImages ?? 20,
    sendMessageToCloud: data?.metrics_is_send_iothub,
    framesPerMin: data?.metrics_frame_per_minutes,
    probThreshold: data?.prob_threshold ?? 10,
    name: data?.name ?? '',
    inferenceMode: data?.inference_mode ?? '',
    SVTCisOpen: data?.send_video_to_cloud.some((e) => e.send_video_to_cloud),
    SVTCcameras: data?.send_video_to_cloud.map((e) => e.camera),
    // All the camera will detect same parts
    SVTCparts: data?.send_video_to_cloud[0]?.parts || [],
    SVTCconfirmationThreshold: data?.send_video_to_cloud[0]?.send_video_to_cloud_threshold || 0,
    deployTimeStamp: data?.deploy_timestamp ?? '',
    setFpsManually: data?.setFpsManually ?? false,
    fps: data?.fps ?? 10,
    recomendedFps: data?.recomendedFps ?? 10,
    totalRecomendedFps: data?.totalRecomendedFps ?? 10,
    inferenceProtocol: data?.inference_protocol ?? InferenceProtocol.GRPC,
    inferenceSource: data?.inference_source ?? InferenceSource.LVA,
    disableVideoFeed: data?.disable_video_feed ?? false,
  },
  isDemo,
});
const postProjectFail = (error: Error, isDemo: boolean): PostProjectFaliedAction => ({
  type: POST_PROJECT_FALIED,
  error,
  isDemo,
});

const getTrainingMetricsRequest = (isDemo: boolean): GetTrainingMetricsRequestAction => ({
  type: GET_TRAINING_METRICS_REQUEST,
  isDemo,
});
const getTrainingMetricsSuccess = (
  curConsequence: Consequence,
  prevConsequence: Consequence,
  isDemo: boolean,
): GetTrainingMetricsSuccessAction => ({
  type: GET_TRAINING_METRICS_SUCCESS,
  payload: { prevConsequence, curConsequence },
  isDemo,
});
const getTrainingMetricsFailed = (error: Error, isDemo: boolean): GetTrainingMetricsFailedAction => ({
  type: GET_TRAINING_METRICS_FAILED,
  error,
  isDemo,
});

export const startInference = (isDemo: boolean): StartInferenceAction => ({
  type: START_INFERENCE,
  isDemo,
});

export const stopInference = (isDemo: boolean): StopInferenceAction => ({
  type: STOP_INFERENCE,
  isDemo,
});

export const trainSuccess = (): TrainSuccessAction => ({
  type: TRAIN_SUCCESS,
});

export const trainFailed = (): TrainFailedAction => ({
  type: TRAIN_FAILED,
});

export const updateProjectData = (
  partialProjectData: Partial<ProjectData>,
  isDemo: boolean,
): UpdateProjectDataAction => ({
  type: UPDATE_PROJECT_DATA,
  payload: partialProjectData,
  isDemo,
});

export const changeStatus = (status: Status, isDemo: boolean): ChangeStatusAction => ({
  type: 'CHANGE_STATUS',
  status,
  isDemo,
});

const getProjectData = (state: State): ProjectData => state.project.data;

export const thunkGetProject = (): ProjectThunk => (dispatch): Promise<boolean> => {
  dispatch(getProjectRequest(false));

  const getPartDetection = Axios.get('/api/part_detections/');
  const getInferenceModule = Axios.get('/api/inference_modules/');

  return Promise.all([getPartDetection, getInferenceModule])
    .then((results) => {
      const partDetection = results[0].data;
      const infModuleIdx = results[1].data.findIndex((e) => e.id === partDetection[0].inference_module);
      const totalRecomendedFps = results[1].data[infModuleIdx]?.recommended_fps;
      const recomendedFps = Math.floor(totalRecomendedFps / (partDetection[0].cameras?.length || 1));

      const project: ProjectData = {
        id: partDetection[0]?.id ?? null,
        cameras: partDetection[0]?.cameras ?? [],
        location: partDetection[0]?.location ?? null,
        parts: partDetection[0]?.parts ?? [],
        modelUrl: partDetection[0]?.download_uri ?? '',
        needRetraining: partDetection[0]?.needRetraining ?? true,
        accuracyRangeMin: partDetection[0]?.accuracyRangeMin ?? 60,
        accuracyRangeMax: partDetection[0]?.accuracyRangeMax ?? 80,
        maxImages: partDetection[0]?.maxImages ?? 20,
        sendMessageToCloud: partDetection[0]?.metrics_is_send_iothub,
        framesPerMin: partDetection[0]?.metrics_frame_per_minutes,
        probThreshold: partDetection[0]?.prob_threshold ?? 10,
        trainingProject: partDetection[0]?.project ?? null,
        name: partDetection[0]?.name ?? '',
        inferenceMode: partDetection[0]?.inference_mode ?? '',
        SVTCisOpen: partDetection[0]?.send_video_to_cloud.some((e) => e.send_video_to_cloud),
        SVTCcameras: partDetection[0]?.send_video_to_cloud.map((e) => e.camera),
        // All the camera will detect same parts
        SVTCparts: partDetection[0]?.send_video_to_cloud[0]?.parts || [],
        SVTCconfirmationThreshold:
          partDetection[0]?.send_video_to_cloud[0]?.send_video_to_cloud_threshold || 0,
        deployTimeStamp: partDetection[0]?.deploy_timestamp ?? '',
        setFpsManually: partDetection[0]?.fps !== recomendedFps,
        recomendedFps,
        fps: partDetection[0]?.fps ?? 10,
        totalRecomendedFps,
        inferenceProtocol: partDetection[0]?.inference_protocol ?? InferenceProtocol.GRPC,
        inferenceSource: partDetection[0]?.inference_source ?? InferenceSource.LVA,
        disableVideoFeed: partDetection[0]?.disable_video_feed ?? false,
      };
      dispatch(getProjectSuccess(project, partDetection[0]?.has_configured, false));
      return partDetection[0]?.has_configured;
    })
    .catch((err) => {
      dispatch(getProjectFailed(err, false));
    });
};

export const thunkPostProject = (projectData: Omit<ProjectData, 'id'>): ProjectThunk => (
  dispatch,
  getState,
): Promise<number> => {
  const projectId = getState().project.data.id;
  const isProjectEmpty = projectId === null || projectId === undefined;
  const url = isProjectEmpty ? `/api/part_detections/` : `/api/part_detections/${projectId}/`;
  const isDemo = getState().trainingProject.isDemo.includes(projectData.trainingProject);

  dispatch(postProjectRequest(false));

  return Axios(url, {
    data: {
      parts: projectData.parts,
      cameras: projectData.cameras,
      project: projectData.trainingProject,
      needRetraining: isDemo ? false : projectData.needRetraining,
      accuracyRangeMin: projectData.accuracyRangeMin,
      accuracyRangeMax: projectData.accuracyRangeMax,
      maxImages: projectData.maxImages,
      metrics_is_send_iothub: projectData.sendMessageToCloud,
      metrics_frame_per_minutes: projectData.framesPerMin,
      prob_threshold: projectData.probThreshold,
      name: projectData.name,
      send_video_to_cloud: projectData.cameras.map((e) => ({
        camera: e,
        parts: projectData.SVTCparts,
        send_video_to_cloud: projectData.SVTCcameras.includes(e),
        send_video_to_cloud_threshold: projectData.SVTCconfirmationThreshold,
      })),
      inference_mode: projectData.inferenceMode,
      fps: projectData.setFpsManually ? projectData.fps : projectData.recomendedFps,
      inference_protocol: projectData.inferenceProtocol,
      disable_video_feed: projectData.disableVideoFeed,
    },
    method: isProjectEmpty ? 'POST' : 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(({ data }) => {
      dispatch(
        postProjectSuccess(
          { ...data, setFpsManually: projectData.setFpsManually, recomendedFps: projectData.recomendedFps },
          false,
        ),
      );
      return data.id;
    })
    .catch((err) => {
      dispatch(postProjectFail(err, false));
    }) as Promise<number>;
};

export const getConfigure = createWrappedAsync<any, number>('project/configure', async (projectId) => {
  await Axios.get(`/api/part_detections/${projectId}/configure`);
});

export const thunkGetTrainingMetrics = (trainingProjectId: number, isDemo: boolean) => (
  dispacth,
): Promise<any> => {
  dispacth(getTrainingMetricsRequest(isDemo));

  return Axios.get(`/api/projects/${trainingProjectId}/train_performance`)
    .then(({ data }) => {
      const newIteration = data.iterations.find((e) => e.iteration_name === 'new');
      const prevIteration = data.iterations.find((e) => e.iteration_name === 'previous');

      const curConsequence: Consequence = newIteration
        ? {
            precision: newIteration.precision,
            recall: newIteration.recall,
            mAP: newIteration.map,
          }
        : null;

      const prevConsequence: Consequence = prevIteration
        ? {
            precision: prevIteration.precision,
            recall: prevIteration.recall,
            mAP: prevIteration.map,
          }
        : null;

      return dispacth(getTrainingMetricsSuccess(curConsequence, prevConsequence, isDemo));
    })
    .catch((err) => dispacth(getTrainingMetricsFailed(err, isDemo)));
};

export const updateProbThreshold = createWrappedAsync<any, undefined, { state: State }>(
  'project/updateProbThreshold',
  async (_, { getState }) => {
    const { id: projectId, probThreshold } = getProjectData(getState());

    const response = await Axios.get(
      `/api/part_detections/${projectId}/update_prob_threshold?prob_threshold=${probThreshold}`,
    );
    return response.data;
  },
);

export const thunkUpdateAccuracyRange = (isDemo: boolean): ProjectThunk => (
  dispatch,
  getState,
): Promise<any> => {
  dispatch(postProjectRequest(isDemo));
  const { id: projectId, accuracyRangeMin, accuracyRangeMax } = getProjectData(getState());

  return Axios.patch(`/api/part_detections/${projectId}/`, {
    accuracyRangeMin,
    accuracyRangeMax,
  })
    .then(({ data }) => {
      dispatch(postProjectSuccess(data, isDemo));
      return void 0;
    })
    .catch((e) => {
      if (e.response) {
        throw new Error(e.response.data.log);
      } else if (e.request) {
        throw new Error(e.request);
      } else {
        throw e;
      }
    })
    .catch((e) => {
      dispatch(postProjectFail(e, isDemo));
    });
};

export const thunkCheckAndSetAccuracyRange = (newSelectedParts: any[], isDemo: boolean): ProjectThunk => (
  dispatch,
  getState,
): void => {
  const images = selectAllImages(getState()).filter((e) => !e.isRelabel);

  const partsWithImageLength = images.reduce((acc, cur) => {
    const id = cur.part;
    const relatedPartIdx = acc.findIndex((e) => e.id === id);
    if (relatedPartIdx >= 0) acc[relatedPartIdx].length = acc[relatedPartIdx].length + 1 || 1;
    return acc;
  }, R.clone(newSelectedParts));

  const minimumLengthPart = partsWithImageLength.reduce(
    (acc, cur) => {
      if (cur.length < acc.length) return { name: cur.name, length: cur.length };
      return acc;
    },
    { name: '', length: Infinity },
  );
  if (minimumLengthPart.length === Infinity) return;
  if (minimumLengthPart.length < 30) {
    dispatch(updateProjectData({ accuracyRangeMax: 40, accuracyRangeMin: 10 }, isDemo));
  } else if (minimumLengthPart.length >= 30 && minimumLengthPart.length < 80) {
    dispatch(updateProjectData({ accuracyRangeMax: 60, accuracyRangeMin: 30 }, isDemo));
  } else if (minimumLengthPart.length >= 80 && minimumLengthPart.length < 130) {
    dispatch(updateProjectData({ accuracyRangeMax: 80, accuracyRangeMin: 50 }, isDemo));
  } else if (minimumLengthPart.length >= 130) {
    dispatch(updateProjectData({ accuracyRangeMax: 90, accuracyRangeMin: 60 }, isDemo));
  }
};

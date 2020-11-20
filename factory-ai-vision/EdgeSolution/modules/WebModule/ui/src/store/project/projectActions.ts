/* eslint-disable @typescript-eslint/camelcase */
import Axios from 'axios';

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
  InferenceProtocol,
  InferenceSource,
  TrainSuccessAction,
  TRAIN_SUCCESS,
  TrainFailedAction,
  TRAIN_FAILED,
} from './projectTypes';
import { createWrappedAsync, getErrorLog } from '../shared/createWrappedAsync';

import { extractRecommendFps } from '../../utils/extractRecommendFps';

const getProjectRequest = (): GetProjectRequestAction => ({
  type: GET_PROJECT_REQUEST,
});
export const getProjectSuccess = (project: ProjectData, hasConfigured: boolean): GetProjectSuccessAction => ({
  type: GET_PROJECT_SUCCESS,
  payload: { project, hasConfigured },
});
const getProjectFailed = (error: Error): GetProjectFailedAction => ({
  type: GET_PROJECT_FAILED,
  error,
});

const postProjectRequest = (): PostProjectRequestAction => ({
  type: POST_PROJECT_REQUEST,
});
const postProjectSuccess = (data: ProjectData): PostProjectSuccessAction => ({
  type: POST_PROJECT_SUCCESS,
  data,
});
const postProjectFail = (error: Error): PostProjectFaliedAction => ({
  type: POST_PROJECT_FALIED,
  error,
});

export const trainSuccess = (): TrainSuccessAction => ({
  type: TRAIN_SUCCESS,
});

export const trainFailed = (): TrainFailedAction => ({
  type: TRAIN_FAILED,
});

export const updateProjectData = (partialProjectData: Partial<ProjectData>): UpdateProjectDataAction => ({
  type: UPDATE_PROJECT_DATA,
  payload: partialProjectData,
});

const normalizeServerToClient = (data, recomendedFps: number, totalRecomendedFps: number): ProjectData => ({
  id: data?.id ?? null,
  cameras: data?.cameras ?? [],
  parts: data?.parts ?? [],
  trainingProject: data?.project ?? null,
  name: data?.name ?? '',
  // Retraining
  needRetraining: data?.needRetraining ?? true,
  accuracyRangeMin: data?.accuracyRangeMin ?? 60,
  accuracyRangeMax: data?.accuracyRangeMax ?? 80,
  maxImages: data?.maxImages ?? 20,
  // Cloud message
  sendMessageToCloud: data?.metrics_is_send_iothub,
  framesPerMin: data?.metrics_frame_per_minutes,
  probThreshold: data?.prob_threshold ?? 60,
  inferenceMode: data?.inference_mode ?? '',
  // Send video to cloud
  SVTCisOpen: data?.send_video_to_cloud.some((e) => e.send_video_to_cloud),
  SVTCcameras: data?.send_video_to_cloud.some((e) => e.send_video_to_cloud)
    ? data?.send_video_to_cloud.map((e) => e.camera)
    : [],
  SVTCparts: data?.send_video_to_cloud[0]?.parts || [], // All the camera will detect same parts
  SVTCconfirmationThreshold: data?.send_video_to_cloud[0]?.send_video_to_cloud_threshold || 0,
  SVTCRecordingDuration: data?.send_video_to_cloud[0]?.recording_duration ?? 1,
  SVTCEnableTracking: data?.send_video_to_cloud[0]?.enable_tracking ?? false,
  // Camera fps
  setFpsManually: data?.fps !== recomendedFps,
  recomendedFps,
  fps: Number(data?.fps).toFixed(1).toString() ?? '10.0',
  totalRecomendedFps,
  // Disable live video
  disableVideoFeed: data?.disable_video_feed ?? false,
  // Other
  deployTimeStamp: data?.deploy_timestamp ?? '',
  inferenceProtocol: data?.inference_protocol ?? InferenceProtocol.GRPC,
  inferenceSource: data?.inference_source ?? InferenceSource.LVA,
});

const getProjectData = (state: State): ProjectData => state.project.data;

export const thunkGetProject = (): ProjectThunk => (dispatch): Promise<boolean> => {
  dispatch(getProjectRequest());

  const getPartDetection = Axios.get('/api/part_detections/');
  const getInferenceModule = Axios.get('/api/inference_modules/');

  return Promise.all([getPartDetection, getInferenceModule])
    .then(
      ([
        {
          data: [partDetection], // Because we will always got one partDetection currently, pick the first one
        },
        { data: inferenceModule },
      ]) => {
        const relatedInferenceModule = inferenceModule.find((e) => e.id === partDetection.inference_module);
        const totalRecomendedFps = relatedInferenceModule?.recommended_fps;

        const baseCameras = partDetection.cameras?.length || 1;
        const recommendedFps = extractRecommendFps(totalRecomendedFps, baseCameras);

        dispatch(
          getProjectSuccess(
            normalizeServerToClient(partDetection, recommendedFps, totalRecomendedFps),
            partDetection?.has_configured,
          ),
        );
        return partDetection?.has_configured;
      },
    )
    .catch((err) => {
      dispatch(getProjectFailed(err));
      alert(getErrorLog(err));
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

  dispatch(postProjectRequest());

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
        recording_duration: projectData.SVTCRecordingDuration,
        enable_tracking: projectData.SVTCEnableTracking,
      })),
      inference_mode: projectData.inferenceMode,
      fps: projectData.setFpsManually ? parseFloat(projectData.fps) : projectData.recomendedFps,
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
          normalizeServerToClient(data, projectData.recomendedFps, projectData.totalRecomendedFps),
        ),
      );
      return data.id;
    })
    .catch((err) => {
      dispatch(postProjectFail(err));
      alert(getErrorLog(err));
    }) as Promise<number>;
};

export const getConfigure = createWrappedAsync<any, number>('project/configure', async (projectId) => {
  await Axios.get(`/api/part_detections/${projectId}/configure`);
});

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

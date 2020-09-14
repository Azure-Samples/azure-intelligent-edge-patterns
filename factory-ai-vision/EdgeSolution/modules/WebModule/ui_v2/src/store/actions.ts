import { createAsyncThunk, createAction, Update } from '@reduxjs/toolkit';
import Axios from 'axios';

import { State } from 'RootStateType';
import { selectNonDemoProject, getTrainingProject } from './trainingProjectSlice';
import { isAOIShape, isCountingLine, isDangerZone } from './shared/VideoAnnoUtil';
import { Image } from './type';

export const updateRelabelImages = createAsyncThunk<any, undefined, { state: State }>(
  'updateRelabel',
  async (_, { getState }) => {
    const data: { partId: number; imageId: number }[] = Object.values(getState().labelImages.entities)
      .filter((e) => e.isRelabel)
      .map((e) => ({ partId: e.part, imageId: e.id }));

    await Axios.post('/api/relabel/update', data);
  },
);

export const deleteImage = createAsyncThunk('images/delete', async (id: number) => {
  await Axios.delete(`/api/images/${id}`);
  return id;
});

type toggleCameraLabelPayload = { cameraId: number; checked: boolean };

const getAOIs = (state: State, cameraId) => {
  const videoAnnoEntities = state.videoAnnos.entities;
  return Object.values(videoAnnoEntities)
    .filter((e) => e.camera === cameraId && isAOIShape(e))
    .map((e) => ({
      id: e.id,
      type: e.type,
      label: e.vertices,
    }));
};

const getCountingLines = (state: State, cameraId) => {
  const videoAnnoEntities = state.videoAnnos.entities;
  return Object.values(videoAnnoEntities)
    .filter((e) => e.camera === cameraId && isCountingLine(e))
    .map((e) => ({
      id: e.id,
      type: e.type,
      label: e.vertices,
    }));
};

const getDangerZones = (state: State, cameraId) => {
  const videoAnnoEntities = state.videoAnnos.entities;
  return Object.values(videoAnnoEntities)
    .filter((e) => e.camera === cameraId && isDangerZone(e))
    .map((e) => ({
      id: e.id,
      type: e.type,
      label: e.vertices,
    }));
};

export const toggleShowAOI = createAsyncThunk<any, toggleCameraLabelPayload, { state: State }>(
  'cameras/toggleShowAOI',
  async ({ cameraId, checked }, { getState }) => {
    const AOIs = getAOIs(getState(), cameraId);
    await Axios.patch(`/api/cameras/${cameraId}/`, { area: JSON.stringify({ useAOI: checked, AOIs }) });
  },
);

export const toggleShowCountingLines = createAsyncThunk<any, toggleCameraLabelPayload, { state: State }>(
  'cameras/toggleShowCountingLines',
  async ({ cameraId, checked }, { getState }) => {
    const countingLines = getCountingLines(getState(), cameraId);
    await Axios.patch(`/api/cameras/${cameraId}/`, {
      lines: JSON.stringify({ useCountingLine: checked, countingLines }),
    });
  },
);

export const toggleShowDangerZones = createAsyncThunk<any, toggleCameraLabelPayload, { state: State }>(
  'cameras/toggleShowDangerZones',
  async ({ cameraId, checked }, { getState }) => {
    const dangerZones = getDangerZones(getState(), cameraId);
    await Axios.patch(`/api/cameras/${cameraId}/`, {
      danger_zones: JSON.stringify({ useDangerZone: checked, dangerZones }),
    });
  },
);

export const updateCameraArea = createAsyncThunk<any, number, { state: State }>(
  'cameras/updateArea',
  async (cameraId, { getState }) => {
    const { useAOI, useCountingLine, useDangerZone } = getState().camera.entities[cameraId];
    const AOIs = getAOIs(getState(), cameraId);
    const countingLines = getCountingLines(getState(), cameraId);
    const dangerZones = getDangerZones(getState(), cameraId);
    await Axios.patch(`/api/cameras/${cameraId}/`, {
      area: JSON.stringify({ useAOI, AOIs }),
      lines: JSON.stringify({ useCountingLine, countingLines }),
      danger_zones: JSON.stringify({ useDangerZone, dangerZones }),
    });
  },
);

export const pullCVProjects = createAsyncThunk<
  any,
  { selectedCustomvisionId: string; loadFullImages: boolean },
  { state: State }
>(
  'trainingProject/pullCVProjects',
  async ({ selectedCustomvisionId, loadFullImages }, { getState, dispatch }) => {
    const trainingProjectId = selectNonDemoProject(getState())[0].id;
    await Axios.get(
      `/api/projects/${trainingProjectId}/pull_cv_project?customvision_project_id=${selectedCustomvisionId}&partial=${Number(
        !loadFullImages,
      )}`,
    );
    // Get training project because the origin project name will be mutate
    dispatch(getTrainingProject(false));
  },
);

export const changeImage = createAction<{ offset: 1 | -1; changePart: Update<Image> }>(
  'labelingPage/goNextImage',
);

const getChangeImageAction = (rootState, offset: 1 | -1) => {
  const { entities } = rootState.labelImages;
  const { imageIds, selectedImageId } = rootState.labelingPage;
  const newImgId = imageIds[imageIds.indexOf(selectedImageId) + offset];

  const partOfCurrentImg = entities[selectedImageId].part;
  const partOfNewImg = entities[newImgId].part;

  // If no part defined in the next image, set it same as the current one.
  const changes = partOfNewImg === null ? { part: partOfCurrentImg } : {};
  return changeImage({ offset, changePart: { id: newImgId, changes } });
};

export const thunkGoNextImage = () => (dispatch, getState: () => State) =>
  dispatch(getChangeImageAction(getState(), 1));

export const thunkGoPrevImage = () => (dispatch, getState: () => State) =>
  dispatch(getChangeImageAction(getState(), -1));

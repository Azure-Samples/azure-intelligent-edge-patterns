import { createAction, Update } from '@reduxjs/toolkit';
import Axios from 'axios';

import { State } from 'RootStateType';
import { isAOIShape, isCountingLine, isDangerZone } from './shared/VideoAnnoUtil';
import { Image } from './type';
import { createWrappedAsync } from './shared/createWrappedAsync';

import { plusOrderVideoAnnos } from '../utils/plusVideoAnnos';

export const updateRelabelImages = createWrappedAsync<any, undefined, { state: State }>(
  'updateRelabel',
  async (_, { getState }) => {
    const data: { partId: number; imageId: number }[] = Object.values(getState().labelImages.entities)
      .filter((e) => e.isRelabel)
      .map((e) => ({ partId: e.part, imageId: e.id }));

    await Axios.post('/api/relabel/update', data);
  },
);

export const deleteImage = createWrappedAsync('images/delete', async (id: number) => {
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

export const toggleShowAOI = createWrappedAsync<any, toggleCameraLabelPayload, { state: State }>(
  'cameras/toggleShowAOI',
  async ({ cameraId, checked }, { getState }) => {
    const AOIs = getAOIs(getState(), cameraId);
    await Axios.patch(`/api/cameras/${cameraId}/`, { area: JSON.stringify({ useAOI: checked, AOIs }) });
  },
);

export const toggleShowCountingLines = createWrappedAsync<any, toggleCameraLabelPayload, { state: State }>(
  'cameras/toggleShowCountingLines',
  async ({ cameraId, checked }, { getState }) => {
    const countingLines = getCountingLines(getState(), cameraId);
    await Axios.patch(`/api/cameras/${cameraId}/`, {
      lines: JSON.stringify({ useCountingLine: checked, countingLines }),
    });
  },
);

export const toggleShowDangerZones = createWrappedAsync<any, toggleCameraLabelPayload, { state: State }>(
  'cameras/toggleShowDangerZones',
  async ({ cameraId, checked }, { getState }) => {
    const dangerZones = getDangerZones(getState(), cameraId);
    await Axios.patch(`/api/cameras/${cameraId}/`, {
      danger_zones: JSON.stringify({ useDangerZone: checked, dangerZones }),
    });
  },
);

export const updateCameraArea = createWrappedAsync<any, number, { state: State }>(
  'cameras/updateArea',
  async (cameraId, { getState }) => {
    const { useAOI, useCountingLine, useDangerZone } = getState().camera.entities[cameraId];
    const AOIs = getAOIs(getState(), cameraId);
    const countingLines = getCountingLines(getState(), cameraId);
    const dangerZones = getDangerZones(getState(), cameraId);

    const enhanceCountingLines = plusOrderVideoAnnos(countingLines);
    const enhancedangerZones = plusOrderVideoAnnos(dangerZones);

    await Axios.patch(`/api/cameras/${cameraId}/`, {
      area: JSON.stringify({ useAOI, AOIs }),
      lines: JSON.stringify({ useCountingLine, enhanceCountingLines }),
      danger_zones: JSON.stringify({ useDangerZone, enhancedangerZones }),
    });
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

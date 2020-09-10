import { createAsyncThunk } from '@reduxjs/toolkit';
import Axios from 'axios';

import { State } from 'RootStateType';
import { selectNonDemoProject, getTrainingProject } from './trainingProjectSlice';
import { isAOIShape } from './shared/VideoAnnoUtil';

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
  Object.values(videoAnnoEntities)
    .filter((e) => e.camera === cameraId && isAOIShape(e))
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
  async () => {
    /** TODO */
  },
);

export const updateCameraArea = createAsyncThunk<any, number, { state: State }>(
  'cameras/updateArea',
  async (cameraId, { getState }) => {
    const { useAOI } = getState().camera.entities[cameraId];
    const AOIs = getAOIs(getState(), cameraId);
    await Axios.patch(`/api/cameras/${cameraId}/`, { area: JSON.stringify({ useAOI, AOIs }) });
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

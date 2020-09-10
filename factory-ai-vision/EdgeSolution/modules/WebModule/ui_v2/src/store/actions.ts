import { createAsyncThunk } from '@reduxjs/toolkit';
import Axios from 'axios';

import { State } from 'RootStateType';
import { Shape } from './shared/BaseShape';
import { selectNonDemoProject, getTrainingProject } from './trainingProjectSlice';

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

export const toggleShowAOI = createAsyncThunk<any, { cameraId: number; showAOI: boolean }, { state: State }>(
  'cameras/toggleShowAOI',
  async ({ cameraId, showAOI }, { getState }) => {
    const AOIEntities = getState().AOIs.entities;
    const AOIs = Object.values(AOIEntities)
      .filter((e) => e.camera === cameraId)
      .map((e) => {
        if (e.type === Shape.BBox)
          return {
            id: e.id,
            type: e.type,
            label: e.vertices,
          };
        if (e.type === Shape.Polygon)
          return {
            id: e.id,
            type: e.type,
            label: e.vertices,
          };
      });
    await Axios.patch(`/api/cameras/${cameraId}/`, { area: JSON.stringify({ useAOI: showAOI, AOIs }) });
  },
);

export const updateCameraArea = createAsyncThunk<any, number, { state: State }>(
  'cameras/updateArea',
  async (cameraId, { getState }) => {
    const { useAOI } = getState().camera.entities[cameraId];
    const AOIEntities = getState().AOIs.entities;
    const AOIs = Object.values(AOIEntities)
      .filter((e) => e.camera === cameraId)
      .map((e) => {
        if (e.type === Shape.BBox)
          return {
            id: e.id,
            type: e.type,
            label: e.vertices,
          };
        if (e.type === Shape.Polygon)
          return {
            id: e.id,
            type: e.type,
            label: e.vertices,
          };
      });
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

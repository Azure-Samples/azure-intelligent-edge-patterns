import { createAsyncThunk } from '@reduxjs/toolkit';
import Axios from 'axios';

import { State } from 'RootStateType';

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
    const AOIs = Object.values(AOIEntities).filter((e) => e.camera === cameraId);
    await Axios.patch(`/api/cameras/${cameraId}/`, { area: JSON.stringify({ useAOI: showAOI, AOIs }) });
  },
);

export const updateCameraArea = createAsyncThunk<any, number, { state: State }>(
  'cameras/updateArea',
  async (cameraId, { getState }) => {
    const { useAOI } = getState().camera.entities[cameraId];
    const AOIEntities = getState().AOIs.entities;
    const AOIs = Object.values(AOIEntities).filter((e) => e.camera === cameraId);
    await Axios.patch(`/api/cameras/${cameraId}/`, { area: JSON.stringify({ useAOI, AOIs }) });
  },
);

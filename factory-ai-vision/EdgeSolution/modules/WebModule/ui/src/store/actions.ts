import { createAsyncThunk, createAction } from '@reduxjs/toolkit';
import Axios from 'axios';

import { State } from 'RootStateType';
import { Position2D } from './type';

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

export const createAOI = createAction<{ id: string; point: Position2D; cameraId: number }>('AOI/createAOI');

export const removeAOI = createAction<{ AOIId: string; cameraId: number }>('AOI/removeAOI');

export const toggleShowAOI = createAsyncThunk<any, { cameraId: number; showAOI: boolean }, { state: State }>(
  'cameras/toggleShowAOI',
  async ({ cameraId, showAOI }, { getState }) => {
    const { AOIs: AOIIds } = getState().camera.entities[cameraId];
    const AOIEntities = getState().AOIs.entities;
    const AOIs = AOIIds.map((e) => AOIEntities[e]);
    await Axios.patch(`/api/cameras/${cameraId}/`, { area: JSON.stringify({ useAOI: showAOI, AOIs }) });
  },
);

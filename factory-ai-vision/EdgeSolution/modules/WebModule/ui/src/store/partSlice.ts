import { createEntityAdapter, createSlice, createSelector } from '@reduxjs/toolkit';
import Axios from 'axios';

import { State } from 'RootStateType';
import { createWrappedAsync } from './shared/createWrappedAsync';

export type Part = {
  id: number;
  name: string;
  description: string;
  trainingProject: number;
  local_image_count: number;
  remote_image_count: number;
};

export type CreatePartPayload = {
  name: string;
  description: string;
  project: number;
};

const normalizePart = (data): Part[] => {
  return data.map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    trainingProject: d.project,
    local_image_count: d.local_image_count,
    remote_image_count: d.remote_image_count,
  }));
};

const entityAdapter = createEntityAdapter<Part>();

export const getParts = createWrappedAsync<any, undefined, { state: State }>('parts/get', async () => {
  const response = await Axios.get('/api/parts/');
  return normalizePart(response.data);
});

export const postPart = createWrappedAsync<any, CreatePartPayload, { state: State }>(
  'parts/post',
  async (payload) => {
    // const trainingProject = getState().trainingProject.nonDemo[0];
    const response = await Axios.post(`/api/parts/`, { ...payload });
    return { ...response.data, trainingProject: response.data.project };
  },
);

export const postPartByProject = createWrappedAsync<
  any,
  {
    data: Pick<Part, 'name' | 'description'>;
    project: number;
  }
>('parts/post', async ({ data, project }) => {
  // const trainingProject = getState().trainingProject.nonDemo[0];
  const response = await Axios.post(`/api/parts/`, { ...data, project: project });
  return { ...response.data, trainingProject: response.data.project };
});

export const patchPart = createWrappedAsync<
  any,
  { data: { name: string; description: string }; id: number },
  { state: State }
>('parts/patch', async ({ data, id }) => {
  const response = await Axios.patch(`/api/parts/${id}/`, data);
  return { id: response.data.id, changes: response.data };
});

export const deletePart = createWrappedAsync<any, number, { state: State }>('parts/delete', async (id) => {
  await Axios.delete(`/api/parts/${id}/`);
  return id;
});

const slice = createSlice({
  name: 'parts',
  initialState: entityAdapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getParts.fulfilled, entityAdapter.setAll)
      .addCase(postPart.fulfilled, entityAdapter.upsertOne)
      .addCase(patchPart.fulfilled, entityAdapter.updateOne)
      .addCase(deletePart.fulfilled, entityAdapter.removeOne);
  },
});

const { reducer } = slice;
export default reducer;

export const {
  selectAll: selectAllParts,
  selectById: selectPartById,
  selectEntities: selectPartEntities,
} = entityAdapter.getSelectors<State>((state) => state.parts);

export const partNamesSelectorFactory = (ids) =>
  createSelector(selectPartEntities, (partEntities) => ids.map((i) => partEntities[i]?.name));

export const trainingProjectPartsSelectorFactory = (trainProject: number) =>
  createSelector(selectAllParts, (parts) => parts.filter((p) => p.trainingProject === trainProject));

export const partOptionsSelectorFactory = (trainProject: number) =>
  createSelector(trainingProjectPartsSelectorFactory(trainProject), (parts) =>
    parts.map((p) => ({ key: p.id, text: p.name })),
  );

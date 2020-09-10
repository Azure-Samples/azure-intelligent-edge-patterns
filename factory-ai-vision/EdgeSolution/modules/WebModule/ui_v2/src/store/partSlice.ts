import { createEntityAdapter, createAsyncThunk, createSlice, createSelector } from '@reduxjs/toolkit';
import Axios from 'axios';

import { State } from 'RootStateType';
import { selectNonDemoProject } from './trainingProjectSlice';
import { pullCVProjects } from './actions';

export type Part = {
  id: number;
  name: string;
  description: string;
  trainingProject: number;
};

const normalizePart = (data): Part[] => {
  return data.map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    trainingProject: d.project,
  }));
};

const entityAdapter = createEntityAdapter<Part>();

export const getParts = createAsyncThunk<any, undefined, { state: State }>(
  'parts/get',
  async () => {
    const response = await Axios.get('/api/parts/');
    return normalizePart(response.data);
  },
  {
    condition: (_, { getState }) => !getState().parts.ids.length,
  },
);

export const postPart = createAsyncThunk<any, Omit<Part, 'id' | 'trainingProject'>, { state: State }>(
  'parts/post',
  async (data, { getState }) => {
    const { id: trainingProject } = selectNonDemoProject(getState())[0];
    const response = await Axios.post(`/api/parts/`, { ...data, project: trainingProject });
    return response.data;
  },
);

export const patchPart = createAsyncThunk<
  any,
  { data: { name: string; description: string }; id: number },
  { state: State }
>('parts/patch', async ({ data, id }) => {
  const response = await Axios.patch(`/api/parts/${id}/`, data);
  return { id: response.data.id, changes: response.data };
});

export const deletePart = createAsyncThunk<any, number, { state: State }>('parts/delete', async (id) => {
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
      .addCase(deletePart.fulfilled, entityAdapter.removeOne)
      .addCase(pullCVProjects.fulfilled, () => entityAdapter.getInitialState());
  },
});

const { reducer } = slice;
export default reducer;

export const {
  selectAll: selectAllParts,
  selectById: selectPartById,
  selectEntities: selectPartEntities,
} = entityAdapter.getSelectors<State>((state) => state.parts);

export const selectPartNamesById = (ids) =>
  createSelector(selectPartEntities, (partEntities) => ids.map((i) => partEntities[i]?.name));

export const selectNonDemoPart = createSelector(
  [selectAllParts, selectNonDemoProject],
  (parts, [nonDemoProject]) => parts.filter((p) => p.trainingProject === nonDemoProject.id),
);

export const selectPartsByTrainProject = (trainProject: number) =>
  createSelector(selectAllParts, (parts) => parts.filter((p) => p.trainingProject === trainProject));

export const partOptionsSelector = (trainProject: number) =>
  createSelector(selectPartsByTrainProject(trainProject), (parts) =>
    parts.map((p) => ({ key: p.id, text: p.name })),
  );

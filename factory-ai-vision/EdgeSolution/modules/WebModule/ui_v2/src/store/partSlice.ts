import { createEntityAdapter, createAsyncThunk, createSlice, createSelector } from '@reduxjs/toolkit';
import Axios from 'axios';

import { State } from 'RootStateType';

export type Part = {
  id: number;
  name: string;
  description: string;
};

const entityAdapter = createEntityAdapter<Part>();

export const getParts = createAsyncThunk<any, boolean, { state: State }>(
  'parts/get',
  async (isDemo) => {
    const response = await Axios.get(`/api/parts?is_demo=${Number(isDemo)}`);
    return response.data;
  },
  {
    condition: (_, { getState }) => getState().parts.ids.length === 0,
  },
);

export const postPart = createAsyncThunk<any, Omit<Part, 'id'>, { state: State }>(
  'parts/post',
  async (data) => {
    const response = await Axios.post(`/api/parts/`, data);
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

export const deletePart = createAsyncThunk<any, number, { state: State }>(
  'parts/delete',
  async (id, { getState }) => {
    const projectId = getState().project.data.id;
    const partName = selectPartById(getState(), id).name;
    await Axios.get(`/api/projects/${projectId}/delete_tag?part_name=${partName}`);
    await Axios.delete(`/api/parts/${id}/`);
    return id;
  },
);

const slice = createSlice({
  name: 'parts',
  initialState: entityAdapter.getInitialState(),
  reducers: {
    clearParts: () => entityAdapter.getInitialState(),
  },
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

export const { clearParts } = slice.actions;

export const {
  selectAll: selectAllParts,
  selectById: selectPartById,
  selectEntities: selectPartEntities,
} = entityAdapter.getSelectors<State>((state) => state.parts);

export const partOptionsSelector = createSelector(selectAllParts, (parts) =>
  parts.map((p) => ({ key: p.id, text: p.name })),
);

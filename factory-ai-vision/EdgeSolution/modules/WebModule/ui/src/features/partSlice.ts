import { createEntityAdapter, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import Axios from 'axios';

import { State } from '../store/State';

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

const slice = createSlice({
  name: 'parts',
  initialState: entityAdapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) => builder.addCase(getParts.fulfilled, entityAdapter.setAll),
});

const { reducer } = slice;
export default reducer;

export const { selectAll: selectAllParts, selectById: selectPartById } = entityAdapter.getSelectors<State>(
  (state) => state.parts,
);

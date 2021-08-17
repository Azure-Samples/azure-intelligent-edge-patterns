import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import Axios from 'axios';
import { State } from 'RootStateType';
import { createWrappedAsync } from './shared/createWrappedAsync';

export type Cascade = {
  id: number;
  name: string;
  flow: string;
  prediction_uri: string;
  raw_data: string;
};

export type CreateCascadePayload = {
  name: string;
  flow: string;
  raw_data: string;
};

const cascadesAdapter = createEntityAdapter<Cascade>();

export const getCascades = createWrappedAsync('cascade/Get', async () => {
  const response = await Axios.get(`/api/cascades`);
  return response.data;
});

export const createCascade = createWrappedAsync<any, CreateCascadePayload>(
  'cascade/Create',
  async (payload) => {
    const response = await Axios.post(`/api/cascades/`, payload);
    return response.data;
  },
);

export const deleteCascade = createWrappedAsync<any, number>('cascade/Delete', async (id: number) => {
  await Axios.delete(`/api/cascades/${id}/`);
  return id;
});

const cascadeSlice = createSlice({
  name: 'cascades',
  initialState: cascadesAdapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCascades.fulfilled, cascadesAdapter.setAll)
      .addCase(createCascade.fulfilled, cascadesAdapter.addOne)
      .addCase(deleteCascade.fulfilled, cascadesAdapter.removeOne);
  },
});

const { reducer } = cascadeSlice;

export default reducer;

export const {
  selectAll: selectAllCascades,
  selectById: selectCascadeById,
  selectEntities: selectCascadeEntities,
} = cascadesAdapter.getSelectors<State>((state) => state.cascade);

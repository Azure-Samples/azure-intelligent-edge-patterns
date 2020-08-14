import { createSlice, createEntityAdapter, createSelector } from '@reduxjs/toolkit';
import { State } from 'RootStateType';
import { BoxLabel } from './type';
import { getCameras } from './cameraSlice';

export type AOI = BoxLabel & { id: string; camera: number };

const entityAdapter = createEntityAdapter<AOI>();

const slice = createSlice({
  name: 'AOI',
  initialState: entityAdapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getCameras.fulfilled, (state, action) => {
      entityAdapter.setAll(state, action.payload.entities.AOIs);
    });
  },
});

const { reducer } = slice;
export default reducer;

export const { selectAll: selectAllAOIs } = entityAdapter.getSelectors<State>((state) => state.AOIs);

export const selectAOIsByCamera = (cameraId: number) =>
  createSelector(selectAllAOIs, (aois) => aois.filter((e) => e.camera === cameraId));

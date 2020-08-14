import { createSlice, createEntityAdapter, createSelector } from '@reduxjs/toolkit';
import { State } from 'RootStateType';
import { BoxLabel } from './type';
import { getCameras } from './cameraSlice';
import { createAOI, removeAOI } from './actions';

export type AOI = BoxLabel & { id: string; camera: number };

const entityAdapter = createEntityAdapter<AOI>();

const slice = createSlice({
  name: 'AOI',
  initialState: entityAdapter.getInitialState(),
  reducers: {
    updateAOI: entityAdapter.updateOne,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCameras.fulfilled, (state, action) => {
        entityAdapter.setAll(state, action.payload.entities.AOIs);
      })
      .addCase(createAOI, (state, action) => {
        const { x, y } = action.payload.point;
        entityAdapter.addOne(state, {
          id: action.payload.id,
          x1: x,
          y1: y,
          x2: x,
          y2: y,
          camera: action.payload.cameraId,
        });
      })
      .addCase(removeAOI, (state, action) => {
        entityAdapter.removeOne(state, action.payload.AOIId);
      });
  },
});

const { reducer } = slice;
export default reducer;

export const { updateAOI } = slice.actions;

export const { selectAll: selectAllAOIs } = entityAdapter.getSelectors<State>((state) => state.AOIs);

export const selectAOIsByCamera = (cameraId: number) =>
  createSelector(selectAllAOIs, (aois) => aois.filter((e) => e.camera === cameraId));

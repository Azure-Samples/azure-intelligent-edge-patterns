import { createSlice, createEntityAdapter, createSelector, PayloadAction, nanoid } from '@reduxjs/toolkit';
import { State } from 'RootStateType';
import { BoxLabel, Position2D } from './type';
import { getCameras } from './cameraSlice';

export type AOI = BoxLabel & { id: string; camera: number };

const entityAdapter = createEntityAdapter<AOI>();

const slice = createSlice({
  name: 'AOI',
  initialState: entityAdapter.getInitialState(),
  reducers: {
    createAOI: (state, action: PayloadAction<{ point: Position2D; cameraId: number }>) => {
      const { x, y } = action.payload.point;
      entityAdapter.addOne(state, {
        id: nanoid(),
        x1: x,
        y1: y,
        x2: x,
        y2: y,
        camera: action.payload.cameraId,
      });
    },
    updateAOI: entityAdapter.updateOne,
    removeAOI: entityAdapter.removeOne,
  },
  extraReducers: (builder) => {
    builder.addCase(getCameras.fulfilled, (state, action) => {
      entityAdapter.setAll(state, action.payload.entities.AOIs);
    });
  },
});

const { reducer } = slice;
export default reducer;

export const { createAOI, updateAOI, removeAOI } = slice.actions;

export const { selectAll: selectAllAOIs } = entityAdapter.getSelectors<State>((state) => state.AOIs);

export const selectAOIsByCamera = (cameraId: number) =>
  createSelector(selectAllAOIs, (aois) => aois.filter((e) => e.camera === cameraId));

import { createSlice, createEntityAdapter, createSelector, Reducer, PayloadAction } from '@reduxjs/toolkit';
import * as R from 'ramda';

import { State } from 'RootStateType';
import { BoxLabel } from './type';
import { getCameras } from './cameraSlice';
import { toggleShowAOI, updateCameraArea } from './actions';

export type AOI = BoxLabel & { id: string; camera: number };

const entityAdapter = createEntityAdapter<AOI>();

const slice = createSlice({
  name: 'AOI',
  initialState: entityAdapter.getInitialState(),
  reducers: {
    createDefaultAOI: (state, action: PayloadAction<AOI>) => {
      const { id, x1, x2, y1, y2, camera } = action.payload;
      entityAdapter.upsertOne(state, {
        id,
        x1,
        y1,
        x2,
        y2,
        camera,
      });
    },
    createAOI: (state, action) => {
      const { x, y } = action.payload.point;
      entityAdapter.addOne(state, {
        id: action.payload.id,
        x1: x,
        y1: y,
        x2: x,
        y2: y,
        camera: action.payload.cameraId,
      });
    },
    removeAOI: entityAdapter.removeOne,
    updateAOI: entityAdapter.updateOne,
  },
  extraReducers: (builder) => {
    builder.addCase(getCameras.fulfilled, (state, action) => {
      entityAdapter.setAll(state, action.payload.entities.AOIs || {});
    });
  },
});

const { reducer } = slice;
/**
 * A reducer enhancer to add a field `originEntities` to store the data from server. No user edit
 */
const addOriginEntitiesReducer: Reducer<
  ReturnType<typeof reducer> & { originEntities: Record<string, AOI> }
> = (state, action) => {
  if (getCameras.fulfilled.match(action)) {
    return { ...reducer(state, action), originEntities: R.clone(action.payload.entities.AOIs) || {} };
  }
  if (toggleShowAOI.fulfilled.match(action)) {
    if (!action.meta.arg.showAOI)
      return {
        ...state,
        ...reducer(state, action),
        ids: Object.keys(state.originEntities),
        entities: R.clone(state.originEntities),
      };
  }
  if (updateCameraArea.fulfilled.match(action)) {
    return { ...reducer(state, action), originEntities: R.clone(state.entities) };
  }
  return { ...state, ...reducer(state, action) };
};

export default addOriginEntitiesReducer;

export const { updateAOI, createAOI, removeAOI, createDefaultAOI } = slice.actions;

export const { selectAll: selectAllAOIs } = entityAdapter.getSelectors<State>((state) => state.AOIs);

export const selectAOIsByCamera = (cameraId: number) =>
  createSelector(selectAllAOIs, (aois) => aois.filter((e) => e.camera === cameraId));

export const selectOriginAOIsByCamera = (cameraId: number) =>
  createSelector(
    (state: State) => Object.values(state.AOIs.originEntities || {}),
    (originAOIs: AOI[]) => originAOIs.filter((e) => e.camera === cameraId),
  );

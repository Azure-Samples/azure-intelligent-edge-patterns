import {
  createSlice,
  createEntityAdapter,
  createSelector,
  Reducer,
  PayloadAction,
  Update,
  nanoid,
} from '@reduxjs/toolkit';
import * as R from 'ramda';

import { State } from 'RootStateType';
import { BoxLabel, Position2D } from './type';
import { getCameras } from './cameraSlice';
import { toggleShowAOI, updateCameraArea } from './actions';
import { Shape, AOI } from './shared/BaseShape';
import { BBox, BBoxAOI } from './shared/Box2d';

// Use enum string to make debugginh easier.
export enum CreatingState {
  Disabled = 'Disabled',
  Waiting = 'Waiting',
  Creating = 'Creating',
}

const entityAdapter = createEntityAdapter<AOI>();

const slice = createSlice({
  name: 'AOI',
  initialState: {
    ...entityAdapter.getInitialState(),
    creatingState: CreatingState.Disabled,
    shape: Shape.None,
  },
  reducers: {
    createDefaultAOI: (state, action: PayloadAction<BBoxAOI>) => {
      entityAdapter.upsertOne(state, action.payload);
    },
    onCreatingPoint: (state, action: PayloadAction<{ point: Position2D; cameraId: number }>) => {
      const { point, cameraId } = action.payload;

      if (state.creatingState === CreatingState.Waiting) {
        state.creatingState = CreatingState.Creating;
        entityAdapter.addOne(state, BBox.init(point, nanoid(), cameraId));
      } else if (state.creatingState === CreatingState.Creating) {
        const id = state.ids[state.ids.length - 1];
        const newAOI = BBox.add(point, state.entities[id] as BBoxAOI);

        state.creatingState = CreatingState.Disabled;
        state.shape = Shape.None;
        entityAdapter.updateOne(state, { id, changes: newAOI });
      }
    },
    removeAOI: entityAdapter.removeOne,
    updateAOI: (state, action: PayloadAction<Update<BoxLabel>>) => {
      const { id, changes } = action.payload;
      const newAOI = BBox.update(changes, state.entities[id] as BBoxAOI);

      entityAdapter.updateOne(state, { id, changes: newAOI });
    },
    onCreateAOIBtnClick: (state, action: PayloadAction<Shape>) => {
      if (state.creatingState === CreatingState.Disabled) {
        state.creatingState = CreatingState.Waiting;
        state.shape = action.payload;
      } else if (state.shape !== action.payload) {
        state.shape = action.payload;
      } else {
        state.creatingState = CreatingState.Disabled;
        state.shape = Shape.None;
      }
    },
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

export const { updateAOI, onCreatingPoint, removeAOI, createDefaultAOI, onCreateAOIBtnClick } = slice.actions;

export const { selectAll: selectAllAOIs } = entityAdapter.getSelectors<State>((state) => state.AOIs);

export const selectAOIsByCamera = (cameraId: number) =>
  createSelector(selectAllAOIs, (aois) => aois.filter((e) => e.camera === cameraId));

export const selectOriginAOIsByCamera = (cameraId: number) =>
  createSelector(
    (state: State) => Object.values(state.AOIs.originEntities || {}),
    (originAOIs: AOI[]) => originAOIs.filter((e) => e.camera === cameraId),
  );

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
import { BoxLabel, Position2D, PolygonLabel } from './type';
import { getCameras } from './cameraSlice';
import { toggleShowAOI, updateCameraArea } from './actions';
import { Shape, AOI } from './shared/BaseShape';
import { BBox, BBoxAOI, isBBox } from './shared/Box2d';
import { Polygon, PolygonAOI, isPolygon } from './shared/Polygon';

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
    onCreatingPoint: (
      state,
      action: PayloadAction<{ point: Position2D; cameraId: number; isDBClick?: boolean }>,
    ) => {
      const { point, cameraId } = action.payload;

      if (state.creatingState === CreatingState.Waiting) {
        state.creatingState = CreatingState.Creating;
        if (state.shape === Shape.BBox) entityAdapter.addOne(state, BBox.init(point, nanoid(), cameraId));
        else if (state.shape === Shape.Polygon)
          entityAdapter.addOne(state, Polygon.init(point, nanoid(), cameraId));
      } else if (state.creatingState === CreatingState.Creating) {
        const id = state.ids[state.ids.length - 1];

        if (state.shape === Shape.BBox) {
          entityAdapter.updateOne(state, { id, changes: BBox.add(point, state.entities[id] as BBoxAOI) });
          state.creatingState = CreatingState.Disabled;
          state.shape = Shape.None;
        } else if (state.shape === Shape.Polygon) {
          entityAdapter.updateOne(state, {
            id,
            changes: Polygon.add(point, state.entities[id] as PolygonAOI),
          });
        }
      }
    },
    removeAOI: entityAdapter.removeOne,
    updateAOI: (
      state,
      action: PayloadAction<Update<BoxLabel> | Update<{ idx: number; vertex: Position2D }>>,
    ) => {
      const { id } = action.payload;
      if (isBBox(state.entities[id])) {
        const { changes } = action.payload as Update<BoxLabel>;
        entityAdapter.updateOne(state, {
          id,
          changes: BBox.update(changes as Partial<BoxLabel>, state.entities[id] as BBoxAOI),
        });
      } else if (isPolygon(state.entities[id])) {
        const { changes } = action.payload as Update<{ idx: number; vertex: Position2D }>;
        entityAdapter.updateOne(state, {
          id,
          changes: Polygon.update(changes.idx, changes.vertex, state.entities[id] as PolygonAOI),
        });
      }
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
    finishLabel: (state) => {
      if (state.shape === Shape.Polygon) {
        const lastPoly = state.entities[state.ids[state.ids.length - 1]].vertices as PolygonLabel;
        if (lastPoly.length > 3) {
          lastPoly.pop();
          state.creatingState = CreatingState.Disabled;
          state.shape = Shape.None;
        }
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

export const {
  updateAOI,
  onCreatingPoint,
  removeAOI,
  createDefaultAOI,
  onCreateAOIBtnClick,
  finishLabel,
} = slice.actions;

export const { selectAll: selectAllAOIs } = entityAdapter.getSelectors<State>((state) => state.AOIs);

export const selectAOIsByCamera = (cameraId: number) =>
  createSelector(selectAllAOIs, (aois) => aois.filter((e) => e.camera === cameraId));

export const selectOriginAOIsByCamera = (cameraId: number) =>
  createSelector(
    (state: State) => Object.values(state.AOIs.originEntities || {}),
    (originAOIs: AOI[]) => originAOIs.filter((e) => e.camera === cameraId),
  );

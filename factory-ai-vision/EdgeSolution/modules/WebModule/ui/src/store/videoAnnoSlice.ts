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
import { toggleShowAOI, updateCameraArea, toggleShowCountingLines } from './actions';
import { Shape, VideoAnno, Purpose } from './shared/BaseShape';
import { BBox, BBoxType, isBBox } from './shared/Box2d';
import { Polygon, PolygonType, isPolygon } from './shared/Polygon';
import { Line, LineType, isLine } from './shared/Line';

// Use enum string to make debugging easier.
export enum CreatingState {
  Disabled = 'Disabled',
  Waiting = 'Waiting',
  Creating = 'Creating',
}

const entityAdapter = createEntityAdapter<VideoAnno>();

const slice = createSlice({
  name: 'videoAnno',
  initialState: {
    ...entityAdapter.getInitialState(),
    creatingState: CreatingState.Disabled,
    shape: Shape.None,
    purpose: Purpose.None,
  },
  reducers: {
    onCreatingPoint: (state, action: PayloadAction<{ point: Position2D; cameraId: number }>) => {
      const { point, cameraId } = action.payload;
      const { purpose } = state;

      if (state.creatingState === CreatingState.Waiting) {
        state.creatingState = CreatingState.Creating;
        if (state.shape === Shape.BBox)
          entityAdapter.addOne(state, BBox.init(point, nanoid(), cameraId, purpose));
        else if (state.shape === Shape.Polygon)
          entityAdapter.addOne(state, Polygon.init(point, nanoid(), cameraId, purpose));
        else if (state.shape === Shape.Line)
          entityAdapter.addOne(state, Line.init(point, nanoid(), cameraId, purpose));
      } else if (state.creatingState === CreatingState.Creating) {
        const id = state.ids[state.ids.length - 1];

        if (state.shape === Shape.BBox) {
          entityAdapter.updateOne(state, { id, changes: BBox.add(point, state.entities[id] as BBoxType) });
          state.creatingState = CreatingState.Disabled;
          state.shape = Shape.None;
          state.purpose = Purpose.None;
        } else if (state.shape === Shape.Polygon) {
          entityAdapter.updateOne(state, {
            id,
            changes: Polygon.add(point, state.entities[id] as PolygonType),
          });
        } else if (state.shape === Shape.Line) {
          entityAdapter.updateOne(state, { id, changes: Line.add(point, state.entities[id] as LineType) });
          state.creatingState = CreatingState.Disabled;
          state.shape = Shape.None;
          state.purpose = Purpose.None;
        }
      }
    },
    removeVideoAnno: entityAdapter.removeOne,
    updateVideoAnno: (
      state,
      action: PayloadAction<Update<BoxLabel> | Update<{ idx: number; vertex: Position2D }>>,
    ) => {
      const { id } = action.payload;
      if (isBBox(state.entities[id])) {
        const { changes } = action.payload as Update<BoxLabel>;
        entityAdapter.updateOne(state, {
          id,
          changes: BBox.update(changes as Partial<BoxLabel>, state.entities[id] as BBoxType),
        });
      } else if (isPolygon(state.entities[id])) {
        const { changes } = action.payload as Update<{ idx: number; vertex: Position2D }>;
        entityAdapter.updateOne(state, {
          id,
          changes: Polygon.update(changes.idx, changes.vertex, state.entities[id] as PolygonType),
        });
      } else if (isLine(state.entities[id])) {
        const { changes } = action.payload as Update<{ idx: number; vertex: Position2D }>;
        entityAdapter.updateOne(state, {
          id,
          changes: Line.update(changes.idx, changes.vertex, state.entities[id] as LineType),
        });
      }
    },
    onCreateVideoAnnoBtnClick: (state, action: PayloadAction<{ shape: Shape; purpose: Purpose }>) => {
      const { shape, purpose } = action.payload;

      if (state.creatingState === CreatingState.Disabled) {
        state.creatingState = CreatingState.Waiting;
        state.shape = shape;
        state.purpose = purpose;
      } else if (state.shape !== shape || state.purpose !== purpose) {
        state.shape = shape;
        state.purpose = purpose;
      } else {
        state.creatingState = CreatingState.Disabled;
        state.shape = Shape.None;
        state.purpose = Purpose.None;
      }
    },
    finishLabel: (state) => {
      if (state.shape === Shape.Polygon) {
        const lastPoly = state.entities[state.ids[state.ids.length - 1]].vertices as PolygonLabel;
        if (lastPoly.length > 3) {
          lastPoly.pop();
          state.creatingState = CreatingState.Disabled;
          state.shape = Shape.None;
          state.purpose = Purpose.None;
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
  ReturnType<typeof reducer> & { originEntities: Record<string, VideoAnno> }
> = (state, action) => {
  if (getCameras.fulfilled.match(action)) {
    return { ...reducer(state, action), originEntities: R.clone(action.payload.entities.AOIs) || {} };
  }
  if (toggleShowAOI.fulfilled.match(action) || toggleShowCountingLines.fulfilled.match(action)) {
    if (!action.meta.arg.checked)
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
  updateVideoAnno,
  onCreatingPoint,
  removeVideoAnno,
  onCreateVideoAnnoBtnClick,
  finishLabel,
} = slice.actions;

export const { selectAll: selectAllVideoAnnos } = entityAdapter.getSelectors<State>(
  (state) => state.videoAnnos,
);

export const videoAnnosSelectorFactory = (cameraId: number) =>
  createSelector(selectAllVideoAnnos, (annos) => annos.filter((e) => e.camera === cameraId));

export const originVideoAnnosSelectorFactory = (cameraId: number) =>
  createSelector(
    (state: State) => Object.values(state.videoAnnos.originEntities || {}),
    (originAnnos: VideoAnno[]) => originAnnos.filter((e) => e.camera === cameraId),
  );

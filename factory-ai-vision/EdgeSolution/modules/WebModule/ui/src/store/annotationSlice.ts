import {
  createSlice,
  createEntityAdapter,
  PayloadAction,
  createSelector,
  Reducer,
  nanoid,
  ThunkAction,
  Action,
} from '@reduxjs/toolkit';
import * as R from 'ramda';

import { State } from 'RootStateType';
import { getImages, saveLabelImageAnnotation, saveClassificationImageTag } from './imageSlice';
import { Annotation, AnnotationState, Position2D } from './type';
import { closeLabelingPage } from './labelingPageSlice';

// * Annotation Functions
export const BoxObj = {
  init(imageId: number = null, id: string): Annotation {
    return {
      id,
      image: imageId,
      label: { x1: 0, y1: 0, x2: 0, y2: 0 },
      annotationState: AnnotationState.Empty,
      part: null,
    };
  },
  createWithPoint(p: Position2D, imageId: number, id: string) {
    return BoxObj.add(p, BoxObj.init(imageId, id));
  },
  add({ x, y }, obj) {
    const newObj = { ...obj };

    if (obj.annotationState === AnnotationState.Empty) {
      newObj.label.x1 = x;
      newObj.label.y1 = y;
      newObj.label.x2 = x; // initialize x2 y2
      newObj.label.y2 = y;
      newObj.annotationState = AnnotationState.P1Added;
    } else if (obj.annotationState === AnnotationState.P1Added) {
      newObj.label.x2 = x;
      newObj.label.y2 = y;
      newObj.annotationState = AnnotationState.Finish;
    }

    return BoxObj.setVerticesToValidValue(newObj);
  },
  setVerticesToInt(obj: Annotation): Annotation {
    const roundLabel = {
      x1: Math.round,
      y1: Math.round,
      x2: Math.round,
      y2: Math.round,
    };
    return R.evolve({ label: roundLabel }, obj);
  },
  setVerticesPointsOrder(obj: Annotation): Annotation {
    const newObj = { ...obj };
    const { x1, y1, x2, y2 } = newObj.label;
    if (x1 > x2) {
      newObj.label.x1 = x2;
      newObj.label.x2 = x1;
    }
    if (y1 > y2) {
      newObj.label.y1 = y2;
      newObj.label.y2 = y1;
    }

    return newObj;
  },
  setVerticesToValidValue(object: Annotation): Annotation {
    return R.compose(BoxObj.setVerticesPointsOrder, BoxObj.setVerticesToInt)(object);
  },
};

const entityAdapter = createEntityAdapter<Annotation>();

const slice = createSlice({
  name: 'label',
  initialState: {
    ...entityAdapter.getInitialState(),
    originEntities: entityAdapter.getInitialState().entities,
  },
  reducers: {
    createAnnotation: {
      prepare: (point: Position2D, imageId: number, part: number) => ({
        payload: {
          id: nanoid(),
          point,
          imageId,
          part,
        },
      }),
      reducer: (
        state,
        action: PayloadAction<{ point: Position2D; imageId: number; id: string; part: number }>,
      ) => {
        const { point, imageId, id, part } = action.payload;
        const newAnno = BoxObj.createWithPoint(point, imageId, id);
        entityAdapter.upsertOne(state, { ...newAnno, part });
      },
    },
    createClassification: {
      prepare: (point: Position2D, imageId: number, part: number) => ({
        payload: {
          id: nanoid(),
          point,
          imageId,
          part,
        },
      }),
      reducer: (
        state,
        action: PayloadAction<{ point: Position2D; imageId: number; id: string; part: number }>,
      ) => {
        const { imageId, id, part } = action.payload;
        entityAdapter.upsertOne(state, {
          id,
          image: imageId,
          label: { x1: 0, y1: 0, x2: 1, y2: 1 },
          part,
          annotationState: AnnotationState.Finish,
        });
      },
    },
    updateCreatingAnnotation: (state, action: PayloadAction<Position2D>) => {
      const idOfLastAnno = R.last(state.ids);
      const creatingAnnotation = BoxObj.add(action.payload, state.entities[idOfLastAnno]);

      if (creatingAnnotation.annotationState === AnnotationState.Finish) {
        if (
          // | 0 is same as Math.floor
          (creatingAnnotation.label.x1 | 0) === (creatingAnnotation.label.x2 | 0) &&
          (creatingAnnotation.label.y1 | 0) === (creatingAnnotation.label.y2 | 0)
        ) {
          entityAdapter.removeOne(state, idOfLastAnno);
          return;
        }

        // Box > 10 * 10
        if (
          Math.abs(creatingAnnotation.label.x2 - creatingAnnotation.label.x1) <= 10 ||
          Math.abs(creatingAnnotation.label.y2 - creatingAnnotation.label.y1) <= 10
        ) {
          entityAdapter.removeOne(state, idOfLastAnno);
          return;
        }

        entityAdapter.updateOne(state, { id: idOfLastAnno, changes: creatingAnnotation });
      }
    },
    updateAnnotation: (state, action) => {
      entityAdapter.updateOne(state, action.payload);
    },
    removeAnnotation: (state, action) => entityAdapter.removeOne(state, action.payload),
  },
  extraReducers: (builder) =>
    builder.addCase(getImages.fulfilled, (state, action) => {
      entityAdapter.setAll(state, action.payload.labels || {});
    }),
});

const { reducer } = slice;
/**
 * A reducer enhancer to add a field `originEntities` to store the data from server. No user edit
 */
const addOriginEntitiesReducer: Reducer<
  ReturnType<typeof reducer> & { originEntities: Record<string, Annotation> }
> = (state, action) => {
  if (getImages.fulfilled.match(action)) {
    return { ...reducer(state, action), originEntities: action.payload.labels || {} };
  }
  if (closeLabelingPage.match(action)) {
    return { ...state, entities: R.clone(state.originEntities), ids: Object.keys(state.originEntities) };
  }
  if (saveLabelImageAnnotation.fulfilled.match(action)) {
    return { ...state, originEntities: R.clone(state.entities) };
  }
  if (saveClassificationImageTag.fulfilled.match(action)) {
    return { ...state, originEntities: R.clone(state.entities) };
  }
  return { ...state, ...reducer(state, action) };
};

export default addOriginEntitiesReducer;

export const {
  updateCreatingAnnotation,
  updateAnnotation,
  removeAnnotation,
  createAnnotation,
  createClassification,
} = slice.actions;

export const thunkCreateAnnotation = (
  point: Position2D,
): ThunkAction<void, State, unknown, Action<string>> => (dispatch, getState) => {
  const id = getState().labelingPage.selectedImageId;
  const part = getState().labelingPage.selectedPartId;

  dispatch(createAnnotation(point, id, part));
};

export const { selectAll: selectAllAnno, selectEntities: selectAnnoEntities } = entityAdapter.getSelectors(
  (state: State) => state.annotations,
);

const selectedImageIdSelector = (state: State) => state.labelingPage.selectedImageId;
export const labelPageAnnoSelector = createSelector(
  [selectedImageIdSelector, selectAllAnno],
  (selectedImageId, allAnnos) => allAnnos.filter((anno) => anno.image === selectedImageId),
);
export const imgAnnoSelectorFactory = (imgId: number) =>
  createSelector(selectAllAnno, (anno) => anno.filter((e) => e.image === imgId));

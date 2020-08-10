import {
  createSlice,
  createAsyncThunk,
  nanoid,
  createEntityAdapter,
  createSelector,
  PayloadAction,
} from '@reduxjs/toolkit';
import * as R from 'ramda';
import Axios from 'axios';
import { schema, normalize } from 'normalizr';
import { Annotation, AnnotationState } from './type';
import { openLabelingPage } from './labelingPageSlice';
import { State } from '../store/State';

// Type definition
type ImageFromServer = {
  id: number;
  image: string;
  labels: string;
  is_relabel: boolean;
  confidence: number;
  uploaded: boolean;
  customvision_id: string;
  remote_url: string;
  part: number;
  project: number;
};

type ImageFromServerWithSerializedLabels = Omit<ImageFromServer, 'labels'> & { labels: Annotation[] };

export type Image = {
  id: number;
  image: string;
  part: number;
  isRelabel: boolean;
  confidence: number;
  hasRelabeled: boolean;
};

// Normalization
const normalizeImageShape = (response: ImageFromServerWithSerializedLabels) => {
  return {
    id: response.id,
    image: response.image,
    part: response.part,
    labels: response.labels,
    isRelabel: response.is_relabel,
    confidence: response.confidence,
    hasRelabeled: false,
  };
};

const normalizeImagesAndLabelByNormalizr = (data: ImageFromServerWithSerializedLabels[]) => {
  const labels = new schema.Entity<Annotation>('labels', undefined, {
    processStrategy: (value, parent): Annotation => {
      const { id, ...label } = value;
      return {
        id,
        image: parent.id,
        label,
        annotationState: AnnotationState.Finish,
      };
    },
  });

  const images = new schema.Entity(
    'images',
    { labels: [labels] },
    {
      processStrategy: normalizeImageShape,
    },
  );

  return (normalize(data, [images]) as any) as {
    entities: {
      images: Record<string, Image>;
      labels: Record<string, Annotation>;
    };
    result: number[];
  };
};

const serializeLabels = R.map<ImageFromServer, ImageFromServerWithSerializedLabels>((e) => ({
  ...e,
  labels: (JSON.parse(e.labels) || []).map((l) => ({ ...l, id: nanoid() })),
}));

const normalizeImages = R.compose(normalizeImagesAndLabelByNormalizr, serializeLabels);

// Async Thunk Actions
export const getImages = createAsyncThunk('images/get', async () => {
  const response = await Axios.get(`/api/images/`);
  return normalizeImages(response.data).entities;
});

export const captureImage = createAsyncThunk<
  any,
  { streamId: string; imageIds: number[]; shouldOpenLabelingPage: boolean }
>('image/capture', async ({ streamId, imageIds, shouldOpenLabelingPage }, { dispatch }) => {
  const response = await Axios.get(`/api/streams/${streamId}/capture`);
  const capturedImage = response.data.image;

  if (shouldOpenLabelingPage)
    dispatch(
      openLabelingPage({ imageIds: [...imageIds, capturedImage.id], selectedImageId: capturedImage.id }),
    );

  return normalizeImages([response.data.image]).entities;
});

export const saveLabelImageAnnotation = createAsyncThunk<
  any,
  { isRelabel: boolean; isRelabelDone: boolean },
  { state: State }
>('image/saveAnno', async ({ isRelabel, isRelabelDone }, { getState }) => {
  const imageId = getState().labelingPage.selectedImageId;
  const annoEntities = getState().annotations.entities;
  const labels = Object.values(annoEntities)
    .filter((e: Annotation) => e.image === imageId)
    .map((e: Annotation) => e.label);

  await Axios.patch(`/api/images/${imageId}/`, { labels: JSON.stringify(labels) });
  return { isRelabel, imageId, isRelabelDone };
});

const imageAdapter = createEntityAdapter<Image>();

const slice = createSlice({
  name: 'images',
  initialState: imageAdapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(getImages.fulfilled, (state, action) => {
        imageAdapter.setAll(state, action.payload.images || {});
      })
      .addCase(captureImage.fulfilled, (state, action) => {
        imageAdapter.upsertMany(state, action.payload.images);
      })
      .addCase(
        saveLabelImageAnnotation.fulfilled,
        (state, action: PayloadAction<{ isRelabel: boolean; imageId: number; isRelabelDone: boolean }>) => {
          if (action.payload.isRelabel)
            imageAdapter.updateOne(state, { id: action.payload.imageId, changes: { hasRelabeled: true } });
          if (action.payload.isRelabelDone)
            state.ids.forEach((id) => {
              const { hasRelabeled } = state.entities[id];
              if (!hasRelabeled) state.entities[id].part = null;
            });
        },
      ),
});

const { reducer } = slice;
export default reducer;

export const {
  selectAll: selectAllImages,
  selectEntities: selectImageEntities,
  selectById: selectImageById,
} = imageAdapter.getSelectors<State>((state) => state.labelImages);

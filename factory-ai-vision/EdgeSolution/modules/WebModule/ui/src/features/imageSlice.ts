import { createSlice, createAsyncThunk, nanoid, createEntityAdapter, createSelector } from '@reduxjs/toolkit';
import * as R from 'ramda';
import Axios from 'axios';
import { schema, normalize } from 'normalizr';
import { Annotation, AnnotationState } from '../reducers/labelReducer';
import { selectPartEntities } from './partSlice';
import { openLabelingPage } from './labelingPageSlice';
import { State } from '../store/State';

export type Image = {
  id: number;
  image: string;
  part: number;
  labels: string[];
  isRelabel: boolean;
};

const normalizeImageShape = (response: any): Image => {
  return {
    id: response.id,
    image: response.image,
    part: response.part,
    labels: response.labels,
    isRelabel: response.is_relabel,
  };
};

const normalizeImagesAndLabelByNormalizr = (data) => {
  const labels = new schema.Entity('labels', undefined, {
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

  return normalize(data, [images]);
};

const serializeLabels = R.map<any, any>((e) => ({
  ...e,
  labels: (JSON.parse(e.labels) || []).map((l) => ({ ...l, id: nanoid() })),
}));

const normalizeImages = R.compose(normalizeImagesAndLabelByNormalizr, serializeLabels);

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
      }),
});

const { reducer } = slice;
export default reducer;

export const { selectAll: selectAllImages, selectEntities: selectImageEntities } = imageAdapter.getSelectors<
  State
>((state) => state.labelImages);

export const makeImageWithPartSelector = (partId) =>
  createSelector([selectAllImages, selectPartEntities], (images, partEntities) =>
    images
      .filter((img) => img.part === partId)
      .map((img) => ({
        id: img.id,
        image: img.image,
        labels: '',
        part: {
          id: img.part,
          name: partEntities[img.part].name,
        },
        is_relabel: img.isRelabel,
        confidence: 0,
      })),
  );

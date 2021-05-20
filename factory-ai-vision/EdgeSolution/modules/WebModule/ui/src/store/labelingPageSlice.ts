import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { deleteImage, changeImage } from './actions';

export enum OpenFrom {
  None = 'None',
  // After pressing `Capture image` button in camera detail
  AfterCapture = 'AfterCapture',
  // Clicking the display images
  DisplayImage = 'DisplayImage',
  // After pressing `go tagging` in the capture dialog
  CaptureDialog = 'CaptureDialog',
}

export type LabelPageState = {
  imageIds: number[];
  selectedImageId: number;
  openFrom: OpenFrom;
  selectedPartId: number;
};

const changeSelectedImage = (offset: 1 | -1) => (state: LabelPageState) => {
  const selectedImageIdx = state.imageIds.findIndex((e) => e === state.selectedImageId);
  return {
    ...state,
    selectedImageId: state.imageIds[selectedImageIdx + offset],
  };
};

const slice = createSlice({
  name: 'labelingPage',
  initialState: { imageIds: [], selectedImageId: null, selectedPartId: 0, openFrom: OpenFrom.None },
  reducers: {
    openLabelingPage: (
      _,
      action: PayloadAction<{ imageIds: number[]; selectedImageId: number; openFrom: OpenFrom }>,
    ) => ({
      imageIds: action.payload.imageIds,
      selectedImageId: action.payload.selectedImageId,
      openFrom: action.payload.openFrom,
      selectedPartId: 0,
    }),
    closeLabelingPage: (state) => ({
      ...state,
      imageIds: [],
      selectedImageId: null,
    }),
    changePartId: (state, action: PayloadAction<{ partId: number }>) => ({
      ...state,
      selectedPartId: action.payload.partId,
    }),
  },
  extraReducers: (builder) =>
    builder
      .addCase(deleteImage.fulfilled, (state, action) => {
        const removeIdx = state.imageIds.findIndex((id) => id === action.payload);
        state.imageIds.splice(removeIdx, 1);
        if (state.imageIds.length === 0) state.selectedImageId = null;
        else state.selectedImageId = state.imageIds[removeIdx] || state.imageIds[0];
      })
      .addCase(changeImage, (state, action) => changeSelectedImage(action.payload.offset)(state)),
});

const { reducer } = slice;
export default reducer;

export const { openLabelingPage, closeLabelingPage, changePartId } = slice.actions;

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type LabelPageState = {
  imageIds: number[];
  selectedImageId: number;
};

const slice = createSlice({
  name: 'labelingPage',
  initialState: { imageIds: [], selectedImageId: null },
  reducers: {
    openLabelingPage: (_, action: PayloadAction<{ imageIds: number[]; selectedImageId: number }>) => ({
      imageIds: action.payload.imageIds,
      selectedImageId: action.payload.selectedImageId,
    }),
    closeLabelingPage: () => ({
      imageIds: [],
      selectedImageId: null,
    }),
  },
});

const { reducer } = slice;
export default reducer;

export const { openLabelingPage, closeLabelingPage } = slice.actions;

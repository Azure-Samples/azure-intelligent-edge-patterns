import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type LabelPageState = {
  imageIds: number[];
  selectedImageId: number;
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
    goNextImage: changeSelectedImage(1),
    goPrevImage: changeSelectedImage(-1),
  },
});

const { reducer } = slice;
export default reducer;

export const { openLabelingPage, closeLabelingPage, goNextImage, goPrevImage } = slice.actions;

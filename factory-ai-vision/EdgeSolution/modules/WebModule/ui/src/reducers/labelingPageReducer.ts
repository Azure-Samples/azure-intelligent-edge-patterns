import { Reducer } from './type';
import { OPEN_LABELING_PAGE, CLOSE_LABELING_PAGE, CAPTURE_IMAGE_SUCCESS } from '../action';

export type LabelPageState = {
  imageIds: number[];
  selectedImageId: number;
};

const initialState: LabelPageState = {
  imageIds: [],
  selectedImageId: null,
};

const labelingPageReducer: Reducer<LabelPageState> = (state = initialState, action) => {
  switch (action.type) {
    case OPEN_LABELING_PAGE:
      return {
        imageIds: action.imageIds,
        selectedImageId: action.selectedImageId,
      };
    case CLOSE_LABELING_PAGE:
      return {
        imageIds: [],
        selectedImageId: null,
      };
    case CAPTURE_IMAGE_SUCCESS:
      if (action.shouldOpenLabelingPage) {
        const capturedImgId = action.response.id;
        return {
          imageIds: [...action.imageIds, capturedImgId],
          selectedImageId: capturedImgId,
        };
      }
      return state;
    default:
      return state;
  }
};

export default labelingPageReducer;

import { Reducer } from './type';
import { OPEN_LABELING_PAGE, CLOSE_LABELING_PAGE } from '../action';

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
    default:
      return state;
  }
};

export default labelingPageReducer;

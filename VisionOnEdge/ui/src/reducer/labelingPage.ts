import { UPDATE_ANNOTATION, REQUEST_ANNOTATION_FAILURE, REQUEST_ANNOTATION_SUCCESS } from '../actions/labelingPage';
import { initialState, LabelingPageState } from '../State';

const camerasReducer = (state = initialState.labelingPageState, action): LabelingPageState => {
  switch (action.type) {
    case REQUEST_ANNOTATION_SUCCESS:
      state.annotations = action.payload;
      return state;
    case REQUEST_ANNOTATION_FAILURE:
      return state;
    case UPDATE_ANNOTATION:
      state.annotations[action.payload.index] = action.payload.annotation;
      return state;
    default:
      return state;
  }
};

export default camerasReducer;

import * as R from 'ramda';
import {
  AnnotationState,
  UPDATE_ANNOTATION,
  REQUEST_ANNOTATION_FAILURE,
  REQUEST_ANNOTATION_SUCCESS,
  CREATE_ANNOTATION,
  UPDATE_CREATING_ANNOTATION,
  REMOVE_ANNOTATION,
  AnnotationAction,
  RESET_ANNOTATION,
} from './labelingPageTypes';
import { initialState, LabelingPageState } from '../State';

const labelingPageStateReducer = (
  state = initialState.labelingPageState,
  action: AnnotationAction,
): LabelingPageState => {
  const newState = R.clone(state);
  switch (action.type) {
    case REQUEST_ANNOTATION_SUCCESS:
      newState.annotations = action.payload.annotations;
      break;
    case REQUEST_ANNOTATION_FAILURE:
      break;
    case CREATE_ANNOTATION:
      newState.annotations.push(action.payload.annotation);
      break;
    case UPDATE_CREATING_ANNOTATION:
      {
        const creatingAnnotation = action.payload.updater(
          newState.annotations[newState.annotations.length - 1],
        );

        if (creatingAnnotation.annotationState === AnnotationState.Finish) {
          if (
            (creatingAnnotation.label.x1 | 0) === (creatingAnnotation.label.x2 | 0) &&
            (creatingAnnotation.label.y1 | 0) === (creatingAnnotation.label.y2 | 0)
          ) {
            newState.annotations.pop();
          } else {
            newState.annotations[newState.annotations.length - 1] = creatingAnnotation;
            newState.annotations = [...newState.annotations];
          }
        }
      }
      break;
    case UPDATE_ANNOTATION:
      newState.annotations[action.payload.index] = action.payload.annotation;
      break;
    case REMOVE_ANNOTATION:
      newState.annotations = newState.annotations
        .slice(0, action.payload.index)
        .concat(newState.annotations.slice(action.payload.index + 1));
      break;
    case RESET_ANNOTATION:
      newState.annotations = initialState.labelingPageState.annotations;
      break;
    default:
      return state;
  }
  return newState;
};

export default labelingPageStateReducer;

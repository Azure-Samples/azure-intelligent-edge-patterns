import {
  UPDATE_ANNOTATION,
  REQUEST_ANNOTATION_FAILURE,
  REQUEST_ANNOTATION_SUCCESS,
  CREATE_ANNOTATION,
  UPDATE_CREATING_ANNOTATION,
  FINISH_CREATING_ANNOTATION,
  BoxObj,
  REMOVE_ANNOTATION,
  AnnotationAction,
} from '../actions/labelingPage';
import { initialState, LabelingPageState } from '../State';
import { AnnotationState } from '../components/LabelingPage/types';

const labelingPageStateReducer = (
  state = initialState.labelingPageState,
  action: AnnotationAction,
): LabelingPageState => {
  const newState = state;
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
      newState.annotations[newState.annotations.length - 1] = action.payload.updater(
        newState.annotations[newState.annotations.length - 1],
      );
      newState.annotations = [...newState.annotations];

      break;
    case FINISH_CREATING_ANNOTATION:
      {
        const creatingAnnotation = newState.annotations[newState.annotations.length - 1];
        if (creatingAnnotation.annotationState === AnnotationState.P1Added) {
          if (
            (creatingAnnotation.label.x1 | 0) === (creatingAnnotation.label.x2 | 0) &&
            (creatingAnnotation.label.y1 | 0) === (creatingAnnotation.label.y2 | 0)
          ) {
            newState.annotations.pop();
          } else {
            newState.annotations[newState.annotations.length - 1] = BoxObj.setVerticesToValidValue(
              newState.annotations[newState.annotations.length - 1],
            );
            newState.annotations[newState.annotations.length - 1].annotationState = AnnotationState.Finish;
          }
        } else {
          throw new Error('Wrong Annotation State');
        }
      }
      break;
    case UPDATE_ANNOTATION:
      newState.annotations[action.payload.index] = action.payload.annotation;
      break;
    case REMOVE_ANNOTATION:
      if (action.payload.index === null) {
        const clear = window.confirm('Are you going to remove all annotations?');
        if (clear) newState.annotations = [];
      }
      newState.annotations = newState.annotations
        .slice(0, action.payload.index)
        .concat(newState.annotations.slice(action.payload.index + 1));

      break;
    default:
      return state;
  }
  return newState;
};

export default labelingPageStateReducer;

import {
  Annotation,
  AnnotationState,
  BoxObject,
  Position2D,
  REQUEST_ANNOTATION_SUCCESS,
  REMOVE_ANNOTATION,
  CREATE_ANNOTATION,
  UPDATE_CREATING_ANNOTATION,
  UPDATE_ANNOTATION,
  RESET_ANNOTATION,
  RequestAnnotationSuccessAction,
  CreateAnnotationAction,
  UpdateAnnotationAction,
  UpdateCreatingAnnotationAction,
  RemoveAnnotationAction,
  ResetAnnotationAction,
} from './labelingPageTypes';
import { LabelImage } from '../image/imageTypes';

export const requestAnnotationsSuccess = (data: Annotation[]): RequestAnnotationSuccessAction => ({
  type: REQUEST_ANNOTATION_SUCCESS,
  payload: { annotations: data },
});

export const getAnnotations = (imageId: number) => (dispatch, getState): void => {
  const { images }: { images: LabelImage[] } = getState();
  const { labels, part } = images.find((image) => image.id === imageId);

  if (labels === null) {
    dispatch(requestAnnotationsSuccess([]));
  } else {
    const annotations: Annotation[] = JSON.parse(labels).map((parsedLabels, i) => ({
      id: i,
      label: parsedLabels,
      part,
      annotationState: AnnotationState.Finish,
    }));

    dispatch(requestAnnotationsSuccess(annotations));
  }
};

export const createAnnotation = (pos: Position2D): CreateAnnotationAction => {
  const annotation = BoxObj.createWithPoint(pos, '');
  return {
    type: CREATE_ANNOTATION,
    payload: { annotation },
  };
};

export const updateCreatingAnnotation = (pos: Position2D): UpdateCreatingAnnotationAction => {
  const updater = (annotation: Annotation): Annotation => BoxObj.add(pos, annotation);
  return {
    type: UPDATE_CREATING_ANNOTATION,
    payload: { updater },
  };
};

export const updateAnnotation = (index: number = null, annotation: Annotation): UpdateAnnotationAction => ({
  type: UPDATE_ANNOTATION,
  payload: { index, annotation: BoxObj.setVerticesToValidValue(annotation) },
});

export const removeAnnotation = (index: number = null): RemoveAnnotationAction => ({
  type: REMOVE_ANNOTATION,
  payload: { index },
});

export const resetAnnotation = (): ResetAnnotationAction => ({
  type: RESET_ANNOTATION,
});

// * Annotation Functions
export const BoxObj: BoxObject = {
  init(): Annotation {
    return {
      id: null,
      label: { x1: 0, y1: 0, x2: 0, y2: 0 },
      part: null,
      annotationState: AnnotationState.Empty,
    };
  },
  createWithPoint(p: Position2D, attribute) {
    const obj = {
      ...this.init(),
      attribute,
    };
    return this.add(p, obj);
  },
  add({ x, y }, obj) {
    // make the original object immutable, for future history usage
    const newObj = { ...obj };

    if (obj.annotationState === AnnotationState.Empty) {
      newObj.label.x1 = x;
      newObj.label.y1 = y;
      newObj.label.x2 = x; // initialize x2 y2
      newObj.label.y2 = y;
      newObj.annotationState = AnnotationState.P1Added;
    } else if (obj.annotationState === AnnotationState.P1Added) {
      newObj.label.x2 = x;
      newObj.label.y2 = y;
      newObj.annotationState = AnnotationState.Finish;
    }

    return this.setVerticesToValidValue(newObj);
  },
  setVerticesToInt(obj: Annotation): Annotation {
    const newObj = { ...obj };
    const { x1, y1, x2, y2 } = newObj.label;
    newObj.label = {
      x1: Math.round(x1),
      y1: Math.round(y1),
      x2: Math.round(x2),
      y2: Math.round(y2),
    };
    return newObj;
  },
  setVerticesPointsOrder(obj: Annotation): Annotation {
    const newObj = { ...obj };
    const { x1, y1, x2, y2 } = newObj.label;
    if (x1 > x2) {
      newObj.label.x1 = x2;
      newObj.label.x2 = x1;
    }
    if (y1 > y2) {
      newObj.label.y1 = y2;
      newObj.label.y2 = y1;
    }

    return newObj;
  },
  setVerticesToValidValue(object: Annotation): Annotation {
    return this.setVerticesPointsOrder(this.setVerticesToInt(object));
  },
  // setFinished(obj: Annotation): Annotation {
  //   if (obj.state === AnnotationState.Created) return;

  //   const newObj = R.clone(obj);
  //   newObj.state = AnnotationState.Created;
  //   newObj.creatingState = undefined;

  //   return newObj;
  // },
  // setStateCreated(idx: number, annotations: Annotation[]): Annotation[] {
  //   const { creatingState } = annotations[idx];

  //   if (creatingState === 'addedX2Y2') return R.update(idx, this.setFinished, annotations);
  //   if (creatingState === 'addedX1Y1') return R.remove(idx, 1, annotations);
  //   return R.clone(annotations);
  // },
};

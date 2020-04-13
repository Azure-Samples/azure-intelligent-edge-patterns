import {
  Annotation,
  AnnotationState,
  BoxObject,
  Position2D,
  REQUEST_ANNOTATION_FAILURE,
  REQUEST_ANNOTATION_SUCCESS,
  REMOVE_ANNOTATION,
  CREATE_ANNOTATION,
  UPDATE_CREATING_ANNOTATION,
  UPDATE_ANNOTATION,
  SAVE_ANNOTATION,
  RequestAnnotationSuccessAction,
  RequestAnnotationFailureAction,
  CreateAnnotationAction,
  UpdateAnnotationAction,
  UpdateCreatingAnnotationAction,
  RemoveAnnotationAction,
  SaveAnnotationAction,
} from './labelingPageTypes';
import { LabelImage } from '../part/partTypes';

const requestAnnotationsSuccess = (data: Annotation[]): RequestAnnotationSuccessAction => ({
  type: REQUEST_ANNOTATION_SUCCESS,
  payload: data,
});

const requestAnnotationsFailure = (error: any): RequestAnnotationFailureAction => {
  console.error(error);
  return { type: REQUEST_ANNOTATION_FAILURE };
};

export const getAnnotations = () => (dispatch): Promise<void> => {
  return fetch('/api/annotations/')
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      dispatch(requestAnnotationsSuccess(data));
      return void 0;
    })
    .catch((err) => {
      dispatch(requestAnnotationsFailure(err));
    });
};

export const postAnnotations = (annotations: Annotation[]) => (dispatch): Promise<void> => {
  return fetch('/api/cameras/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(annotations),
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      dispatch(requestAnnotationsSuccess(data));
      return void 0;
    })
    .catch((err) => {
      dispatch(requestAnnotationsFailure(err));
    });
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

// const saveAnnotationSuccess = (data): SaveAnnotationAction => ({
//   type: SAVE_ANNOTATION,
//   payload: data,
// });
export const saveAnnotation = (image: LabelImage, annotations: Annotation[]) => (dispatch): Promise<void> => {
  return fetch(`/api/annotations/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: `http://localhost:8000/api/images/${image.id}/`,
      labels: JSON.stringify(annotations.map((e) => e.label)),
    }),
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      console.log(data);
      // dispatch(requestAnnotationsSuccess(data));
      return void 0;
    })
    .catch((err) => {
      dispatch(requestAnnotationsFailure(err));
    });
};

// * Annotation Functions
export const BoxObj: BoxObject = {
  init(): Annotation {
    return {
      label: { x1: 0, y1: 0, x2: 0, y2: 0 },
      attribute: '',
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

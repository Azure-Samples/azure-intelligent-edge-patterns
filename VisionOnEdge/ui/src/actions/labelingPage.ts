import { Annotation, AnnotationState, BoxObject, Position2D } from '../components/LabelingPage/types';

// * Request Operation
export const REQUEST_ANNOTATION_FAILURE = 'REQUEST_ANNOTATION_FAILURE';
type RequestAnnotationSuccessAction = { type: typeof REQUEST_ANNOTATION_SUCCESS; payload: any };
export const REQUEST_ANNOTATION_SUCCESS = 'REQUEST_ANNOTATION_SUCCESS';
type RequestAnnotationFailureAction = { type: typeof REQUEST_ANNOTATION_FAILURE };

const requestAnnotationsSuccess = (data: Annotation[]): RequestAnnotationSuccessAction => ({
  type: REQUEST_ANNOTATION_SUCCESS,
  payload: data,
});

const requestAnnotationsFailure = (error: any): RequestAnnotationFailureAction => {
  console.error(error);
  return { type: REQUEST_ANNOTATION_FAILURE };
};

export const getAnnotations = () => (dispatch): Promise<void> => {
  return fetch('/api/cameras/')
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

// * Store Operation
export const CREATE_ANNOTATION = 'CREATE_ANNOTATION';
type CreateAnnotationAction = { type: typeof CREATE_ANNOTATION; payload: { annotation: Annotation } };
export const UPDATE_CREATING_ANNOTATION = 'UPDATE_CREATING_ANNOTATION';
type UpdateCreatingAnnotationAction = {
  type: typeof UPDATE_CREATING_ANNOTATION;
  payload: { updater: (annotation: Annotation) => Annotation };
};
export const FINISH_CREATING_ANNOTATION = 'FINISH_CREATING_ANNOTATION';
type FinishCreatingAnnotationAction = {
  type: typeof FINISH_CREATING_ANNOTATION;
};
export const UPDATE_ANNOTATION = 'UPDATE_ANNOTATION';
type UpdateAnnotationAction = {
  type: typeof UPDATE_ANNOTATION;
  payload: { annotation: Annotation; index: number };
};
export const REMOVE_ANNOTATION = 'REMOVE_ANNOTATION';
type RemoveAnnotationAction = {
  type: typeof REMOVE_ANNOTATION;
  payload: { index: number };
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

export const finishCreatingAnnotation = (): FinishCreatingAnnotationAction => {
  return {
    type: FINISH_CREATING_ANNOTATION,
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
    }

    return this.setVerticesToInt(newObj);
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

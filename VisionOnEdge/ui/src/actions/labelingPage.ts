import { Annotation } from '../components/LabelingPage/types';

// * Fetch Operation
export const REQUEST_ANNOTATION_FAILURE = 'REQUEST_ANNOTATION_FAILURE';
export const REQUEST_ANNOTATION_SUCCESS = 'REQUEST_ANNOTATION_SUCCESS';

const requestAnnotationsSuccess = (data: Annotation[]): any => ({
  type: REQUEST_ANNOTATION_SUCCESS,
  payload: data,
});

const requestAnnotationsFailure = (error: any): any => {
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
export const UPDATE_ANNOTATION = 'UPDATE_ANNOTATION';

export const updateAnnotation = (index: number, annotation: Annotation): any => ({
  type: UPDATE_ANNOTATION,
  payload: { index, annotation },
});

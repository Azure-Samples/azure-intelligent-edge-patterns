// * Request Operation
export const REQUEST_ANNOTATION_FAILURE = 'REQUEST_ANNOTATION_FAILURE';
export type RequestAnnotationSuccessAction = { type: typeof REQUEST_ANNOTATION_SUCCESS; payload: any };
export const REQUEST_ANNOTATION_SUCCESS = 'REQUEST_ANNOTATION_SUCCESS';
export type RequestAnnotationFailureAction = { type: typeof REQUEST_ANNOTATION_FAILURE };

// * Store Operation
export const CREATE_ANNOTATION = 'CREATE_ANNOTATION';
export type CreateAnnotationAction = { type: typeof CREATE_ANNOTATION; payload: { annotation: Annotation } };
export const UPDATE_CREATING_ANNOTATION = 'UPDATE_CREATING_ANNOTATION';
export type UpdateCreatingAnnotationAction = {
  type: typeof UPDATE_CREATING_ANNOTATION;
  payload: { updater: (annotation: Annotation) => Annotation };
};
export const UPDATE_ANNOTATION = 'UPDATE_ANNOTATION';
export type UpdateAnnotationAction = {
  type: typeof UPDATE_ANNOTATION;
  payload: { annotation: Annotation; index: number };
};
export const REMOVE_ANNOTATION = 'REMOVE_ANNOTATION';
export type RemoveAnnotationAction = {
  type: typeof REMOVE_ANNOTATION;
  payload: { index: number };
};
export const RESET_ANNOTATION = 'RESET_ANNOTATION';
export type ResetAnnotationAction = {
  type: typeof RESET_ANNOTATION;
};

export type AnnotationAction =
  | RequestAnnotationSuccessAction
  | RequestAnnotationFailureAction
  | CreateAnnotationAction
  | UpdateCreatingAnnotationAction
  | UpdateAnnotationAction
  | RemoveAnnotationAction
  | ResetAnnotationAction;

export type Position2D = {
  x: number;
  y: number;
};
export type BoxLabel = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};
export type Size2D = { width: number; height: number };
export type Annotation = {
  label: BoxLabel;
  attribute: string;
  annotationState: AnnotationState;
};

export enum AnnotationState {
  Empty = 'Empty',
  P1Added = 'P1Added',
  Finish = 'Finish',
}

export enum LabelingCursorStates {
  default = 'default',
  pointer = 'pointer',
  crosshair = 'crosshair',
  neswResize = 'nesw-resize',
  nwseResize = 'nwse-resize',
}
export interface Box2dComponentProps {
  display?: boolean;
  workState: WorkState;
  cursorPosition: Position2D;
  scale: number;
  onSelect: Function;
  annotation: Annotation;
  annotationIndex: number;
  selected: boolean;
  visible?: boolean;
  dispatch: any;
  changeCursorState?: (cursorType?: LabelingCursorStates) => void;
  // instanceID: number;
}
export type BoxObject = {
  init: () => Annotation;
  createWithPoint: (point: Position2D, attribute: string) => Annotation;
  add: (point: Position2D, arg1: Annotation) => Annotation;
  setVerticesToValidValue: (arg0: Annotation) => Annotation;
  setVerticesToInt: (arg0: Annotation) => Annotation;
  setVerticesPointsOrder: (arg0: Annotation) => Annotation;
  // setStateCreated: (arg0: number, arg1: Annotation[]) => Annotation[];
  // setFinished: (arg0: Annotation) => Annotation;
};

export enum WorkState {
  Creating = 'Creating',
  Selecting = 'Selecting',
  None = 'None',
}

export enum LabelingType {
  SingleAnnotation = 0,
  MultiAnnotation = 1,
}

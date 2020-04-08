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

export interface Box2dComponentProps {
  workState: WorkState;
  cursorPosition: Position2D;
  scale: number;
  onSelect: Function;
  annotation: Annotation;
  annotationIndex: number;
  selected: boolean;
  visible?: boolean;
  dispatch: any;
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

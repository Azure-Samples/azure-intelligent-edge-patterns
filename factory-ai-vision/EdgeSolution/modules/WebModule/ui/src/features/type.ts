export type BoxLabel = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export enum AnnotationState {
  Empty = 'Empty',
  P1Added = 'P1Added',
  Finish = 'Finish',
}

export type Annotation = {
  id: string;
  label: BoxLabel;
  image: number;
  annotationState: AnnotationState;
};

import { FC } from 'react';

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
  creatingState: CreatingState;
};

export enum CreatingState {
  Empty = 'Empty',
  P1Added = 'P1Added',
  Finish = 'Finish',
}

export interface Box2dComponentProps {
  annotation: Annotation;
  cursorPosition: Position2D;
  annotationIndex: number;
  // selected: boolean;
  scale: number;
  visible?: boolean;
  // instanceID: number;
}
export type BoxObject = {
  init: () => Annotation;
  createWithPoint: (point: Position2D, attribute: string) => Annotation;
  add: (point: Position2D, arg1: Annotation) => Annotation;
  setVerticesToValidValue: (arg0: Annotation) => Annotation;
  setVerticesToInt: (arg0: Annotation) => Annotation;
  setVerticesPointsOrder: (arg0: Annotation) => Annotation;
  component: FC<Box2dComponentProps>;
  // setStateCreated: (arg0: number, arg1: Annotation[]) => Annotation[];
  // setFinished: (arg0: Annotation) => Annotation;
};

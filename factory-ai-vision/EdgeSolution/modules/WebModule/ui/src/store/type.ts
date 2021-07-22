export type BoxLabel = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type PolygonLabel = Position2D[];

export type LineLabel = [Position2D, Position2D];

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
  part?: number | null;
};

export type Position2D = {
  x: number;
  y: number;
};

export type Size2D = { width: number; height: number };

export type LabelImage = {
  id: number;
  image: string;
  labels: Annotation[];
  part: {
    id: number;
    name: string;
  };
  is_relabel: boolean;
  confidence: number;
  hasRelabeled: boolean;
};

export type Image = {
  id: number;
  image: string;
  part: number;
  readonly isRelabel: boolean;
  confidence: number;
  hasRelabeled: boolean;
  timestamp: string;
  camera: number;
  uploaded: boolean;
  manualChecked: boolean;
  labels: string[];
  project: number;
};

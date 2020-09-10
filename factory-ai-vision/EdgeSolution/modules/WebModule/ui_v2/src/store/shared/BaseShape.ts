import { Position2D, BoxLabel, PolygonLabel, LineLabel } from '../type';

export enum Shape {
  None = 'None',
  BBox = 'BBox',
  Polygon = 'Polygon',
  Line = 'Line',
}

export type VideoAnno = {
  id: string;
  camera: number;
  type: Shape;
  vertices: BoxLabel | PolygonLabel | LineLabel;
};

export class BaseShape {
  static init: (p: Position2D, id: string, camera: number) => VideoAnno;

  static add: (p: Position2D, obj: VideoAnno) => VideoAnno;

  static setVerticesToValidValue: (obj: VideoAnno) => VideoAnno;

  static setVerticesToInt: (obj: VideoAnno) => VideoAnno;
}

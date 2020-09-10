import { Position2D, BoxLabel, PolygonLabel } from '../type';

export enum Shape {
  None = 'None',
  BBox = 'BBox',
  Polygon = 'Polygon',
  Line = 'Line',
}

export type AOI = {
  id: string;
  camera: number;
  type: Shape;
  vertices: BoxLabel | PolygonLabel;
};

export class BaseShape {
  static init: (p: Position2D, id: string, camera: number) => AOI;

  static add: (p: Position2D, obj: AOI) => AOI;

  static setVerticesToValidValue: (obj: AOI) => AOI;

  static setVerticesToInt: (obj: AOI) => AOI;
}

import * as R from 'ramda';

import { BaseShape, Shape, VideoAnno, Purpose } from './BaseShape';
import { Position2D, PolygonLabel } from '../type';
// TODO Share this with annoSlice

export type PolygonType = VideoAnno & {
  type: Shape.Polygon;
  vertices: PolygonLabel;
  order?: number;
};

export class Polygon extends BaseShape {
  static init(p: Position2D, id: string, camera: number, purpose: Purpose): PolygonType {
    return Polygon.setVerticesToValidValue({
      id,
      camera,
      purpose,
      type: Shape.Polygon,
      vertices: [p, p],
    });
  }

  static add(p: Position2D, obj: PolygonType): PolygonType {
    const updateLast = R.evolve({
      vertices: R.update(-1, p),
    });

    const concatOne = R.evolve({
      vertices: R.concat([p]),
    });

    return R.compose(Polygon.setVerticesToValidValue, concatOne, updateLast)(obj) as PolygonType;
  }

  static update(idx: number, p: Position2D, obj: PolygonType): PolygonType {
    const update = R.evolve({ vertices: R.update(idx, p) });
    return R.compose(Polygon.setVerticesToValidValue, update)(obj);
  }

  static setVerticesToInt(obj: PolygonType): PolygonType {
    const newObj = { ...obj };
    newObj.vertices = newObj.vertices.map((e) => ({
      x: Math.round(e.x),
      y: Math.round(e.y),
    }));
    return newObj;
  }

  static setVerticesToValidValue(obj: PolygonType): PolygonType {
    return Polygon.setVerticesToInt(obj);
  }
}

export const isPolygon = (input: VideoAnno): input is PolygonType => {
  return input.type === Shape.Polygon;
};

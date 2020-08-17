import * as R from 'ramda';

import { BaseShape, Shape, AOI } from './BaseShape';
import { Position2D, PolygonLabel } from '../type';
// TODO Share this with annoSlice

export type PolygonAOI = AOI & {
  type: Shape.Polygon;
  vertices: PolygonLabel;
};

export class Polygon extends BaseShape {
  static init(p: Position2D, id: string, camera: number): PolygonAOI {
    return {
      id,
      camera,
      type: Shape.Polygon,
      vertices: [p, p],
    };
  }

  static add(p: Position2D, obj: PolygonAOI): PolygonAOI {
    const updateLast = R.evolve({
      vertices: R.update(-1, p),
    });

    const concatOne = R.evolve({
      vertices: R.concat([p]),
    });

    return R.compose(Polygon.setVerticesToValidValue, concatOne, updateLast)(obj) as PolygonAOI;
  }

  static update(idx: number, p: Position2D, obj: PolygonAOI): PolygonAOI {
    return R.evolve({ vertices: R.update(idx, p) }, obj) as PolygonAOI;
  }

  static setVerticesToInt(obj: PolygonAOI): PolygonAOI {
    const newObj = { ...obj };
    newObj.vertices.map((e) => ({
      x: Math.round(e.x),
      y: Math.round(e.y),
    }));
    return newObj;
  }

  static setVerticesToValidValue(obj: PolygonAOI): PolygonAOI {
    return Polygon.setVerticesToInt(obj);
  }
}

export const isPolygon = (input: AOI): input is PolygonAOI => {
  return input.type === Shape.Polygon;
};

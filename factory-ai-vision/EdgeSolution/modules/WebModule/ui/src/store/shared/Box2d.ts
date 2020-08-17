import * as R from 'ramda';

import { BaseShape, Shape, AOI } from './BaseShape';
import { Position2D, BoxLabel } from '../type';
// TODO Share this with annoSlice

export type BBoxAOI = AOI & {
  type: Shape.BBox;
  vertices: BoxLabel;
};

export class BBox extends BaseShape {
  static init(p: Position2D, id: string, camera: number): BBoxAOI {
    const { x, y } = p;
    return {
      id,
      camera,
      type: Shape.BBox,
      vertices: {
        x1: x,
        y1: y,
        x2: x,
        y2: y,
      },
    };
  }

  static add(p: Position2D, obj: BBoxAOI): BBoxAOI {
    const updateLast = R.evolve({
      vertices: R.mergeLeft({ x2: p.x, y2: p.y }),
    });

    return R.compose(BBox.setVerticesToValidValue, updateLast)(obj) as BBoxAOI;
  }

  static update(changes: Partial<BoxLabel>, obj: BBoxAOI): BBoxAOI {
    return R.evolve({ vertices: R.mergeLeft(changes) }, obj) as BBoxAOI;
  }

  static setVerticesPointsOrder(obj: BBoxAOI): BBoxAOI {
    const newObj = R.clone(obj);
    const { x1, y1, x2, y2 } = newObj.vertices;
    if (x1 > x2) {
      newObj.vertices.x1 = x2;
      newObj.vertices.x2 = x1;
    }
    if (y1 > y2) {
      newObj.vertices.y1 = y2;
      newObj.vertices.y2 = y1;
    }

    return newObj;
  }

  static setVerticesToInt(obj: BBoxAOI): BBoxAOI {
    const newObj = { ...obj };
    const { x1, y1, x2, y2 } = newObj.vertices;
    newObj.vertices = {
      x1: Math.round(x1),
      y1: Math.round(y1),
      x2: Math.round(x2),
      y2: Math.round(y2),
    };
    return newObj;
  }

  static setVerticesToValidValue(obj: BBoxAOI): BBoxAOI {
    return R.compose(BBox.setVerticesPointsOrder, BBox.setVerticesToInt)(obj);
  }
}

export const isBBox = (input: AOI): input is BBoxAOI => {
  return input.type === Shape.BBox;
};

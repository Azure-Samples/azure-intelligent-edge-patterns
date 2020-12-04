import * as R from 'ramda';

import { BaseShape, Shape, VideoAnno, Purpose } from './BaseShape';
import { Position2D, BoxLabel } from '../type';
// TODO Share this with annoSlice

export type BBoxType = VideoAnno & {
  type: Shape.BBox;
  vertices: BoxLabel;
  order?: number;
};

export class BBox extends BaseShape {
  static init(p: Position2D, id: string, camera: number, purpose: Purpose): BBoxType {
    const { x, y } = p;
    return BBox.setVerticesToValidValue({
      id,
      camera,
      type: Shape.BBox,
      purpose,
      vertices: {
        x1: x,
        y1: y,
        x2: x,
        y2: y,
      },
    });
  }

  static add(p: Position2D, obj: BBoxType): BBoxType {
    const updateLast = R.evolve({
      vertices: R.mergeLeft({ x2: p.x, y2: p.y }),
    });

    return R.compose(BBox.setVerticesToValidValue, updateLast)(obj) as BBoxType;
  }

  static update(changes: Partial<BoxLabel>, obj: BBoxType): BBoxType {
    const change = R.evolve({ vertices: R.mergeLeft(changes) });
    return R.compose(BBox.setVerticesToValidValue, change)(obj);
  }

  static setVerticesPointsOrder(obj: BBoxType): BBoxType {
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

  static setVerticesToInt(obj: BBoxType): BBoxType {
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

  static setVerticesToValidValue(obj: BBoxType): BBoxType {
    return R.compose(BBox.setVerticesPointsOrder, BBox.setVerticesToInt)(obj);
  }
}

export const isBBox = (input: VideoAnno): input is BBoxType => {
  return input.type === Shape.BBox;
};

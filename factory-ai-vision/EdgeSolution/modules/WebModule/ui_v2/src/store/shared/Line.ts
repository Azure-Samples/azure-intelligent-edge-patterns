import * as R from 'ramda';

import { BaseShape, Shape, AOI } from './BaseShape';
import { Position2D, LineLabel } from '../type';
// TODO Share this with annoSlice

export type LineAOI = AOI & {
  type: Shape.Line;
  vertices: LineLabel;
};

export class Line extends BaseShape {
  static init(p: Position2D, id: string, camera: number): LineAOI {
    return Line.setVerticesToValidValue({
      id,
      camera,
      type: Shape.Line,
      vertices: [p, p],
    });
  }

  static add(p: Position2D, obj: LineAOI): LineAOI {
    const updateLast = R.evolve({
      vertices: R.update(-1, p),
    });

    return R.compose(Line.setVerticesToValidValue, updateLast)(obj) as LineAOI;
  }

  static update(idx: number, p: Position2D, obj: LineAOI): LineAOI {
    const update = R.evolve({ vertices: R.update(idx, p) });
    return R.compose(Line.setVerticesToValidValue, update)(obj);
  }

  static setVerticesToInt(obj: LineAOI): LineAOI {
    const newObj = { ...obj };
    newObj.vertices = newObj.vertices.map((e) => ({
      x: Math.round(e.x),
      y: Math.round(e.y),
    })) as [Position2D, Position2D];
    return newObj;
  }

  static setVerticesToValidValue(obj: LineAOI): LineAOI {
    return Line.setVerticesToInt(obj);
  }
}

export const isLine = (input: AOI): input is LineAOI => {
  return input.type === Shape.Line;
};

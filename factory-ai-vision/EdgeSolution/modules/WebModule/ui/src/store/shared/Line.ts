import * as R from 'ramda';

import { BaseShape, Shape, VideoAnno, Purpose } from './BaseShape';
import { Position2D, LineLabel } from '../type';
// TODO Share this with annoSlice

export type LineType = VideoAnno & {
  type: Shape.Line;
  vertices: LineLabel;
  order?: number;
};

export class Line extends BaseShape {
  static init(p: Position2D, id: string, camera: number, purpose: Purpose): LineType {
    return Line.setVerticesToValidValue({
      id,
      camera,
      purpose,
      type: Shape.Line,
      vertices: [p, p],
    });
  }

  static add(p: Position2D, obj: LineType): LineType {
    const updateLast = R.evolve({
      vertices: R.update(-1, p),
    });

    return R.compose(Line.setVerticesToValidValue, updateLast)(obj) as LineType;
  }

  static update(idx: number, p: Position2D, obj: LineType): LineType {
    const update = R.evolve({ vertices: R.update(idx, p) });
    return R.compose(Line.setVerticesToValidValue, update)(obj);
  }

  static setVerticesToInt(obj: LineType): LineType {
    const newObj = { ...obj };
    newObj.vertices = newObj.vertices.map((e) => ({
      x: Math.round(e.x),
      y: Math.round(e.y),
    })) as [Position2D, Position2D];
    return newObj;
  }

  static setVerticesToValidValue(obj: LineType): LineType {
    return Line.setVerticesToInt(obj);
  }
}

export const isLine = (input: VideoAnno): input is LineType => {
  return input.type === Shape.Line;
};

import React from 'react';
import { Shape } from 'react-konva';

import { VideoAnno } from '../../store/shared/BaseShape';
import { isBBox } from '../../store/shared/Box2d';
import { isPolygon } from '../../store/shared/Polygon';

const polygonArea = (vertices) => {
  let area = 0;
  for (let i = 0; i < vertices.length; i++) {
    const j = (i + 1) % vertices.length;
    area += vertices[i].x * vertices[j].y;
    area -= vertices[j].x * vertices[i].y;
  }
  return area / 2;
};

export type MaskProps = {
  width: number;
  height: number;
  holes: VideoAnno[];
  visible: boolean;
};

export const Mask: React.FC<MaskProps> = ({ width, height, holes, visible }) => {
  return (
    <Shape
      width={width}
      height={height}
      fill={'rgba(0,0,0,0.5)'}
      visible={visible}
      sceneFunc={(ctx, shape): void => {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(shape.width(), 0);
        ctx.lineTo(shape.width(), shape.height());
        ctx.lineTo(0, shape.height());
        ctx.lineTo(0, 0);

        // Nonozero-rule
        holes.forEach((e) => {
          if (isBBox(e)) {
            const { x1, y1, x2, y2 } = e.vertices;
            ctx.moveTo(x1, y1);
            ctx.lineTo(x1, y2);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x2, y1);
            ctx.lineTo(x1, y1);
          } else if (isPolygon(e)) {
            const vertices = [...e.vertices];
            const head = vertices[0];
            ctx.moveTo(head.x, head.y);

            // check if the array is in counter clockwise
            if (polygonArea(vertices) > 0) vertices.reverse();

            vertices.forEach((p) => {
              ctx.lineTo(p.x, p.y);
            });
            ctx.lineTo(head.x, head.y);
          }
        });

        ctx.fillStrokeShape(shape);
      }}
      listening={false}
    />
  );
};

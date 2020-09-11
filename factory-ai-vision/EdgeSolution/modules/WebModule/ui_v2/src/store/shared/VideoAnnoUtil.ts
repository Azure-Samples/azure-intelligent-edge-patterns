import { VideoAnno, Shape } from './BaseShape';

export const isAOIShape = (anno: VideoAnno): boolean => [Shape.BBox, Shape.Polygon].includes(anno.type);

export const isCountingLine = (anno: VideoAnno): boolean => anno.type === Shape.Line;

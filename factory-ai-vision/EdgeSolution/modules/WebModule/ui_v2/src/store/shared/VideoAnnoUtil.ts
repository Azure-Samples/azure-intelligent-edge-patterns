import { VideoAnno, Purpose } from './BaseShape';

export const isAOIShape = (anno: VideoAnno): boolean => anno.purpose === Purpose.AOI;

export const isCountingLine = (anno: VideoAnno): boolean => anno.purpose === Purpose.Counting;

export const isDangerZone = (anno: VideoAnno): boolean => anno.purpose === Purpose.DangerZone;

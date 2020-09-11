import { Position2D, BoxLabel } from '../../store/type';
import { CreatingState } from '../../store/videoAnnoSlice';
import { VideoAnno, Shape } from '../../store/shared/BaseShape';

export type Box = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type LiveViewProps = {
  videoAnnos: VideoAnno[];
  creatingShape: Shape;
  onCreatingPoint: (point: Position2D) => void;
  updateVideoAnno: (id: string, changes) => void;
  removeVideoAnno: (id: string) => void;
  finishLabel: () => void;
  AOIVisible: boolean;
  countingLineVisible: boolean;
  imageInfo: [HTMLImageElement, string, { width: number; height: number }];
  creatingState: CreatingState;
};

export type VideoAnnosGroupProps = {
  imgWidth: number;
  imgHeight: number;
  videoAnnos: VideoAnno[];
  updateVideoAnno: (id: string, changes) => void;
  removeVideoAnno: (id: string) => void;
  visible: boolean;
  creatingState: CreatingState;
  needMask: boolean;
};

export type MaskProps = {
  width: number;
  height: number;
  holes: VideoAnno[];
  visible: boolean;
};

export type BoxProps = {
  box: Box;
  onBoxChange: (changes: Partial<BoxLabel>) => void;
  boundary: { x1: number; y1: number; x2: number; y2: number };
  visible: boolean;
  removeBox: (id: string) => void;
  creatingState: CreatingState;
};

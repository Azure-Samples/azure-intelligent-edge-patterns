import { Position2D, BoxLabel } from '../../store/type';
import { CreatingState } from '../../store/AOISlice';
import { AOI, Shape } from '../../store/shared/BaseShape';

export type Box = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type LiveViewProps = {
  AOIs: AOI[];
  creatingShape: Shape;
  onCreatingPoint: (point: Position2D) => void;
  updateAOI: (id: string, changes) => void;
  removeAOI: (id: string) => void;
  finishLabel: () => void;
  visible: boolean;
  imageInfo: [HTMLImageElement, string, { width: number; height: number }];
  creatingState: CreatingState;
};

export type AOILayerProps = {
  imgWidth: number;
  imgHeight: number;
  AOIs: AOI[];
  updateAOI: (id: string, changes) => void;
  removeAOI: (id: string) => void;
  visible: boolean;
  creatingState: CreatingState;
};

export type MaskProps = {
  width: number;
  height: number;
  holes: AOI[];
  visible: boolean;
};

export type AOIBoxProps = {
  box: Box;
  onBoxChange: (changes: Partial<BoxLabel>) => void;
  boundary: { x1: number; y1: number; x2: number; y2: number };
  visible: boolean;
  removeBox: (id: string) => void;
  creatingState: CreatingState;
};

import { Dispatch, SetStateAction } from 'react';
import { Box } from '../../type';
import { Position2D, BoxLabel } from '../../store/type';

export enum CreatingState {
  Disabled,
  Waiting,
  Creating,
}

export type LiveViewProps = {
  AOIs: Box[];
  createAOI: (point: Position2D) => void;
  updateAOI: (id: string, changes: Partial<BoxLabel>) => void;
  removeAOI: (id: string) => void;
  visible: boolean;
  imageInfo: [HTMLImageElement, string, { width: number; height: number }];
  creatingState: CreatingState;
  setCreatingState: Dispatch<SetStateAction<CreatingState>>;
};

export type AOILayerProps = {
  imgWidth: number;
  imgHeight: number;
  AOIs: Box[];
  updateAOI: (id: string, changes: Partial<BoxLabel>) => void;
  removeAOI: (id: string) => void;
  visible: boolean;
  creatingState: CreatingState;
};

export type MaskProps = {
  width: number;
  height: number;
  holes: Box[];
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

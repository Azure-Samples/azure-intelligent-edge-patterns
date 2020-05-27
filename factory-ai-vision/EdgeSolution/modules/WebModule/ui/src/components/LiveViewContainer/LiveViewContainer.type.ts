import { Dispatch, SetStateAction } from 'react';

export type Box = { x1: number; y1: number; x2: number; y2: number };

export type LiveViewProps = {
  AOIs: Box[];
  setAOIs: Dispatch<SetStateAction<Box[]>>;
};

export type MaskProps = {
  width: number;
  height: number;
  holes: Box[];
};

export type AOIBoxProps = {
  box: Box;
  onBoxChange: (updateBox: (prevBox: Box) => Box) => void;
};

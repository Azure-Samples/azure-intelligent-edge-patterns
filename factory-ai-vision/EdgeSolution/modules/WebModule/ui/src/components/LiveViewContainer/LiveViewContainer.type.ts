import { Dispatch, SetStateAction } from 'react';
import { Box } from '../../type';

export type LiveViewProps = {
  AOIs: Box[];
  setAOIs: Dispatch<SetStateAction<Box[]>>;
  visible: boolean;
  imageInfo: [HTMLImageElement, string, { width: number; height: number }];
};

export type AOILayerProps = {
  imgWidth: number;
  imgHeight: number;
  AOIs: Box[];
  setAOIs: Dispatch<SetStateAction<Box[]>>;
  visible: boolean;
};

export type MaskProps = {
  width: number;
  height: number;
  holes: Box[];
  visible: boolean;
};

export type AOIBoxProps = {
  box: Box;
  onBoxChange: (updateBox: (prevBox: Box) => Box) => void;
  boundary: Box;
  visible: boolean;
};

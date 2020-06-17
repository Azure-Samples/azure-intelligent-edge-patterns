export type Box = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

// Area of Interest
export type AOIData = {
  useAOI: boolean;
  AOIs: Box[];
};

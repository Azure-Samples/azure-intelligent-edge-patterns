import { Dispatch } from 'react';

export type RTSPVideoProps = {
  rtsp: string;

  partId: number;

  partName: string;

  canCapture: boolean;

  setOpenLabelingPage: Dispatch<boolean>;
  /**
   * Will automatically create stream if it is true.
   */
  autoPlay: boolean;
};

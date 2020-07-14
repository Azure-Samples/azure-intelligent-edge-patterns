import { Dispatch } from 'react';

export type RTSPVideoProps = {
  rtsp: string;

  canCapture: boolean;
  /**
   * partId, partName, setOpenLabelingPage should be provided if canCapture is true
   */
  partId?: number;

  partName?: string;

  setOpenLabelingPage?: Dispatch<boolean>;
  /**
   * Will automatically create stream if it is true.
   */
  autoPlay: boolean;
};

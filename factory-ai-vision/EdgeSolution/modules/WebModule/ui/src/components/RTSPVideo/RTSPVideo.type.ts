import { Dispatch } from 'react';

export type RTSPVideoProps = {
  rtsp: string;
  partId: number;
  partName: string;
  canCapture: boolean;
  onVideoStart?: () => void;
  onVideoPause?: () => void;
  setOpenLabelingPage: Dispatch<boolean>;
};

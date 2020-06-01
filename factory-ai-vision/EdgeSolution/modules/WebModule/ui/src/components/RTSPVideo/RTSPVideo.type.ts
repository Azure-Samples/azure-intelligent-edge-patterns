export type RTSPVideoProps = {
  rtsp: string;
  partId: number;
  canCapture: boolean;
  onVideoStart?: () => void;
  onVideoPause?: () => void;
};

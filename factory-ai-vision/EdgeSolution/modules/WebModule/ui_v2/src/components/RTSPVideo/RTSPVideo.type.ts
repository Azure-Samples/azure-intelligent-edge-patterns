export enum CaptureLabelMode {
  PerImage,
  AllLater,
}

export type RTSPVideoProps = {
  rtsp: string;

  canCapture: boolean;
  /**
   * partId, partName, setOpenLabelingPage should be provided if canCapture is true
   */
  partId?: number;

  partName?: string;

  onCapturePhoto?: (streamId?: string, mode?: CaptureLabelMode) => void;
  /**
   * Will automatically create stream if it is true.
   */
  autoPlay: boolean;
};

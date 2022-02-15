import { OpenVinoType } from '../store/IntelProjectSlice';

export const convertProjectType = (type: OpenVinoType) => {
  if (type === 'ObjectDetection') return 'Object Detection';
  return 'Classification';
};

import { LabelImage } from '../../store/image/imageTypes';

export type JudgedImageList = { correct: number[]; incorrect: { partId: number; imageId: number }[] };

export type RelabelImage = LabelImage & {
  confidenceLevel: number;
  display: boolean;
};

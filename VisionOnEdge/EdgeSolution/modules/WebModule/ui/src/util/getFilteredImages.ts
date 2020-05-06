import { LabelImage } from '../store/image/imageTypes';

interface Options {
  partId?: string;
}
export const getFilteredImages = (images: LabelImage[], { partId }: Options): LabelImage[] => {
  if (partId === undefined) return images;
  return images.filter((image) => image.part.split('/')[5] === partId);
};

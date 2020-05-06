import { LabelImage } from '../store/image/imageTypes';
import { getIdFromUrl } from './GetIDFromUrl';

interface Options {
  partId?: number;
}
export const getFilteredImages = (images: LabelImage[], { partId }: Options): LabelImage[] => {
  if (partId === undefined) return images;
  return images.filter((image) => getIdFromUrl(image.part) === partId);
};

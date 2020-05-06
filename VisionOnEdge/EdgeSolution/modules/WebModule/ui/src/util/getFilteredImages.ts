import { LabelImage } from '../store/image/imageTypes';
import { getIdFromUrl } from './GetIDFromUrl';

interface Options {
  partId?: number;
  is_relabel?: boolean;
}
export const getFilteredImages = (images: LabelImage[], { partId, is_relabel }: Options): LabelImage[] => {
  if (partId === undefined) return images;
  return images.filter((image) => getIdFromUrl(image.part) === partId);
};

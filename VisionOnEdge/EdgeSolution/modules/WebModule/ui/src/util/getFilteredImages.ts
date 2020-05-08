import { LabelImage } from '../store/image/imageTypes';
import { getIdFromUrl } from './GetIDFromUrl';

interface Options {
  partId?: number;
  isRelabel?: boolean;
}
export const getFilteredImages = (
  images: LabelImage[],
  { partId, isRelabel = false }: Options,
): LabelImage[] => {
  if (partId === undefined) return images;
  return images.filter((image) => getIdFromUrl(image.part) === partId && image.is_relabel === isRelabel);
};

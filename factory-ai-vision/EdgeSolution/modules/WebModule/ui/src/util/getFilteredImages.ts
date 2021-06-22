import { LabelImage } from '../store/image/imageTypes';

interface Options {
  partId?: number;
  isRelabel?: boolean;
}
export const getFilteredImages = (
  images: LabelImage[],
  { partId, isRelabel = false }: Options,
): LabelImage[] => {
  if (partId === undefined) return images;
  return images.filter((image) => image.part.id === partId && image.is_relabel === isRelabel);
};

import { LabelImage } from '../store/image/imageTypes';

interface Options {
  partId?: number;
  isRelabel?: boolean;
}
export const getFilteredImages = (
  images: LabelImage[],
  { partId, isRelabel = false }: Options,
): LabelImage[] => {
  let filteredImages = images.filter((img) => img.part.id !== null);
  if (partId !== undefined) filteredImages = filteredImages.filter((img) => img.part.id === partId);
  if (isRelabel !== undefined) filteredImages = filteredImages.filter((img) => img.is_relabel === isRelabel);
  return filteredImages;
};

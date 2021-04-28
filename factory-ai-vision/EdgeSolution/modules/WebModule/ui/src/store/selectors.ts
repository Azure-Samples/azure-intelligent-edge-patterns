import { createSelector } from '@reduxjs/toolkit';
import { selectAllImages } from './imageSlice';
import { selectPartEntities, selectAllParts } from './partSlice';
import { Item as ImageListItem } from '../components/ImageList';
import { selectNonDemoProject } from './trainingProjectSlice';
import { selectCameraEntities } from './cameraSlice';
import { selectAllAnno } from './annotationSlice';
import { Image, Annotation } from './type';

const getImgListItem = (
  img: Image,
  partEntities,
  cameraEntities,
  annotations: Annotation[],
): ImageListItem => {
  const part = partEntities[img.part];
  const camera = cameraEntities[img.camera];

  const parts = img.labels
    .map((id) => annotations.find((anno) => anno.id === id).part)
    .filter((part) => part)
    .map((partId) => partEntities[partId])
    .map((part) => ({ id: part.id, name: part.name }));

  return {
    id: img.id,
    image: img.image,
    timestamp: img.timestamp,
    manualChecked: img.manualChecked,
    part: {
      id: part?.id || null,
      name: part?.name || '',
    },
    camera: {
      id: camera?.id || null,
      name: camera?.name || '',
    },
    parts,
  };
};

/**
 * Get the part-image selector by passing the part ID
 * @param partId
 */
export const partImageItemSelectorFactory = (partId) =>
  createSelector(
    [selectAllImages, selectPartEntities, selectCameraEntities, selectAllAnno],
    (images, partEntities, cameraEntities, annotations) =>
      images
        .filter((img) => img.part === partId && !img.isRelabel)
        .map((img) => getImgListItem(img, partEntities, cameraEntities, annotations)),
  );

/**
 * Create a memoize image item selector by passing untagged
 * @param unTagged If the selector need to select untagged image
 */
export const imageItemSelectorFactory = (unTagged: boolean) =>
  createSelector(
    [selectAllImages, selectPartEntities, selectCameraEntities, selectAllAnno],
    (images, partEntities, cameraEntities, annotations) => {
      return images
        .filter((img) => {
          if (unTagged) return !img.manualChecked && !img.isRelabel;
          return img.manualChecked;
        })
        .map((img) => getImgListItem(img, partEntities, cameraEntities, annotations));
    },
  );

export const relabelImageSelector = createSelector(
  [selectAllImages, selectPartEntities, selectCameraEntities],
  (images, partEntities, cameraEntities, annotations) =>
    images
      .filter((img) => img.isRelabel && !img.manualChecked)
      .map((img) => getImgListItem(img, partEntities, cameraEntities, annotations)),
);

export const selectNonDemoPart = createSelector(
  [selectAllParts, selectNonDemoProject],
  (parts, [nonDemoProject]) => parts.filter((p) => p.trainingProject === nonDemoProject.id),
);

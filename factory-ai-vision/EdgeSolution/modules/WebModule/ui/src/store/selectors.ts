import { createSelector } from '@reduxjs/toolkit';
import { selectAllImages } from './imageSlice';
import { selectPartEntities, selectAllParts } from './partSlice';
import { Item as ImageListItem } from '../components/ImageList';
// import { selectNonDemoProject } from './trainingProjectSlice';
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
    [partsImagesSelectorFactory, selectPartEntities, selectCameraEntities, selectAllAnno],
    (partAllImages, partEntities, cameraEntities, annotations) => {
      return partAllImages
        .filter((img) => !img.isRelabel && img.parts.includes(partId))
        .map((img) => getImgListItem(img, partEntities, cameraEntities, annotations));
    },
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
  [selectAllImages, selectPartEntities, selectCameraEntities, selectAllAnno],
  (images, partEntities, cameraEntities, annotations) => {
    return images
      .filter((img) => img.isRelabel && !img.manualChecked)
      .map((img) => getImgListItem(img, partEntities, cameraEntities, annotations));
  },
);

export const selectNonDemoPart = createSelector([selectAllParts], (parts) => parts);

export const partsImagesSelectorFactory = createSelector(
  [selectAllImages, selectAllAnno],
  (images, annotations) =>
    images.map((img) => ({
      ...img,
      parts: img.labels
        .map((label) => annotations.find((anno) => anno.id === label).part)
        .filter((part) => part),
    })),
);

export const selectProjectPartsFactory = (projectId: number) =>
  createSelector([selectAllParts], (parts) => parts.filter((part) => part.trainingProject === projectId));

export const isLabeledImagesSelector = (projectId: number) =>
  createSelector([selectAllImages, selectAllAnno], (images, annotations) => {
    return images
      .filter((image) => image.project === projectId)
      .filter((image) => image.labels.length !== 0)
      .filter((image) => !image.uploaded)
      .map((image) => ({
        ...image,
        labels: image.labels
          .map((label) =>
            annotations.filter((anno) => anno.part).find((annotation) => annotation.id === label),
          )
          .filter((label) => label),
      }));
  });

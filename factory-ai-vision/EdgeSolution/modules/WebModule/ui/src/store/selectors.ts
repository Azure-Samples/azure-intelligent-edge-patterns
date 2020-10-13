import { createSelector } from '@reduxjs/toolkit';
import { selectAllImages } from './imageSlice';
import { selectPartEntities, selectAllParts } from './partSlice';
import { Item as ImageListItem } from '../components/ImageList';
import { selectNonDemoProject } from './trainingProjectSlice';
import { selectCameraEntities } from './cameraSlice';

/**
 * Get the part-image selector by passing the part ID
 * @param partId
 */
export const partImageItemSelectorFactory = (partId) =>
  createSelector(
    [selectAllImages, selectPartEntities, selectCameraEntities],
    (images, partEntities, cameraEntities) =>
      images
        .filter((img) => img.part === partId && !img.isRelabel)
        .map(
          (img): ImageListItem => {
            return {
              id: img.id,
              image: img.image,
              timestamp: img.timestamp,
              manualChecked: img.manualChecked,
              partName: partEntities[img.part]?.name || '',
              cameraName: cameraEntities[img.camera]?.name,
            };
          },
        ),
  );

/**
 * Create a memoize image item selector by passing untagged
 * @param unTagged If the selector need to select untagged image
 */
export const imageItemSelectorFactory = (unTagged: boolean) =>
  createSelector(
    [selectAllImages, selectPartEntities, selectCameraEntities],
    (images, partEntities, cameraEntities) =>
      images
        .filter((img) => {
          if (unTagged) return !img.manualChecked && !img.isRelabel;
          return img.manualChecked;
        })
        .map(
          (img): ImageListItem => {
            return {
              id: img.id,
              image: img.image,
              timestamp: img.timestamp,
              manualChecked: img.manualChecked,
              partName: partEntities[img.part]?.name || '',
              cameraName: cameraEntities[img.camera]?.name,
            };
          },
        ),
  );

export const relabelImageSelector = createSelector(
  [selectAllImages, selectPartEntities, selectCameraEntities],
  (images, partEntities, cameraEntities) =>
    images
      .filter((img) => img.isRelabel && !img.manualChecked)
      .map(
        (img): ImageListItem => {
          return {
            id: img.id,
            image: img.image,
            timestamp: img.timestamp,
            manualChecked: img.manualChecked,
            partName: partEntities[img.part]?.name || '',
            cameraName: cameraEntities[img.camera]?.name,
          };
        },
      ),
);

export const selectNonDemoPart = createSelector(
  [selectAllParts, selectNonDemoProject],
  (parts, [nonDemoProject]) => parts.filter((p) => p.trainingProject === nonDemoProject.id),
);

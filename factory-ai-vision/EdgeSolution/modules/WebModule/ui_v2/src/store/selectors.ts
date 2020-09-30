import { createSelector } from '@reduxjs/toolkit';
import { selectAllImages } from './imageSlice';
import { selectAllAnno } from './annotationSlice';
import { selectPartEntities, selectAllParts } from './partSlice';
import { Item as ImageListItem } from '../components/ImageList';
import { selectNonDemoProject } from './trainingProjectSlice';
import { selectCameraEntities } from './cameraSlice';

const selectImagesByRelabel = (isRelabel) =>
  createSelector(selectAllImages, (images) =>
    images.filter((img) => img.isRelabel === isRelabel && img.part !== null),
  );

const selectImagesByPart = (partId) =>
  createSelector(selectImagesByRelabel(false), (images) => images.filter((img) => img.part === partId));

export const selectImageItemByTaggedPart = (partId) =>
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
              isRelabel: img.isRelabel,
              partName: partEntities[img.part]?.name || '',
              cameraName: cameraEntities[img.camera]?.name,
            };
          },
        ),
  );

export const selectImageItemByUntagged = (unTagged: boolean) =>
  createSelector(
    [selectAllImages, selectAllAnno, selectPartEntities, selectCameraEntities],
    (images, annos, partEntities, cameraEntities) =>
      images
        .filter((img) => {
          const hasAnno = !!annos.find((anno) => img.id === anno.image);
          if (img.isRelabel) return false;
          if (unTagged) return !hasAnno;
          return hasAnno;
        })
        .map(
          (img): ImageListItem => {
            return {
              id: img.id,
              image: img.image,
              timestamp: img.timestamp,
              isRelabel: img.isRelabel,
              partName: partEntities[img.part]?.name || '',
              cameraName: cameraEntities[img.camera]?.name,
            };
          },
        ),
  );

export const selectImageItemByRelabel = () =>
  createSelector(
    [selectAllImages, selectPartEntities, selectCameraEntities],
    (images, partEntities, cameraEntities) =>
      images
        .filter((img) => img.isRelabel)
        .map(
          (img): ImageListItem => {
            return {
              id: img.id,
              image: img.image,
              timestamp: img.timestamp,
              isRelabel: img.isRelabel,
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

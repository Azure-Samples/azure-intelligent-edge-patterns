import { createSelector } from '@reduxjs/toolkit';
import { selectAllImages } from './imageSlice';
import { selectAllAnno } from './annotationSlice';
import { selectPartEntities, selectAllParts } from './partSlice';
import { Item as ImageListItem } from '../components/ImageList';
import { selectNonDemoProject } from './trainingProjectSlice';

const selectImagesByRelabel = (isRelabel) =>
  createSelector(selectAllImages, (images) =>
    images.filter((img) => img.isRelabel === isRelabel && img.part !== null),
  );

const selectImagesByPart = (partId) =>
  createSelector(selectImagesByRelabel(false), (images) => images.filter((img) => img.part === partId));

export const selectImageItemByTaggedPart = (partId) =>
  createSelector([selectAllImages, selectPartEntities], (images, partEntities) =>
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
          };
        },
      ),
  );

export const selectImageItemByUntagged = (unTagged: boolean) =>
  createSelector([selectAllImages, selectAllAnno, selectPartEntities], (images, annos, partEntities) =>
    images
      .filter((img) => {
        const hasAnno = !!annos.find((anno) => img.id === anno.image);
        if (unTagged) return !hasAnno;
        return hasAnno && !img.isRelabel;
      })
      .map(
        (img): ImageListItem => {
          return {
            id: img.id,
            image: img.image,
            timestamp: img.timestamp,
            isRelabel: img.isRelabel,
            partName: partEntities[img.part]?.name || '',
          };
        },
      ),
  );

export const selectImageItemByRelabel = () =>
  createSelector([selectAllImages, selectPartEntities], (images, partEntities) =>
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
          };
        },
      ),
  );

export const selectNonDemoPart = createSelector(
  [selectAllParts, selectNonDemoProject],
  (parts, [nonDemoProject]) => parts.filter((p) => p.trainingProject === nonDemoProject.id),
);

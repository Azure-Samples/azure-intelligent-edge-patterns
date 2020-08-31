import { createSelector } from '@reduxjs/toolkit';
import { selectAllImages } from './imageSlice';
import { selectAllAnno } from './annotationSlice';

const selectImagesByRelabel = (isRelabel) =>
  createSelector(selectAllImages, (images) =>
    images.filter((img) => img.isRelabel === isRelabel && img.part !== null),
  );

const selectImagesByPart = (partId) =>
  createSelector(selectImagesByRelabel(false), (images) => images.filter((img) => img.part === partId));

export const createSelectorByLabel = (hasLabel: boolean) =>
  createSelector([selectAllImages, selectAllAnno], (images, annos) =>
    images.filter((img) => hasLabel === Boolean(annos.find((anno) => img.id === anno.image))),
  );

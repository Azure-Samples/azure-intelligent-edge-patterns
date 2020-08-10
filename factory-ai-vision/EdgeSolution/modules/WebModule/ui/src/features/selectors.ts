import { createSelector } from '@reduxjs/toolkit';
import { selectAllImages } from './imageSlice';
import { selectPartEntities } from './partSlice';
import { selectAllAnno } from './annotationSlice';
import { LabelImage } from './type';

const selectImagesByRelabel = (isRelabel) =>
  createSelector(selectAllImages, (images) =>
    images.filter((img) => img.isRelabel === isRelabel && img.part !== null),
  );

const selectImagesByPart = (partId) =>
  createSelector(selectAllImages, selectImagesByRelabel(false), (images) =>
    images.filter((img) => img.part === partId),
  );

const mapImageToLabelImage = (images, partEntities, allAnno): LabelImage[] =>
  images.map((img) => ({
    id: img.id,
    image: img.image,
    labels: allAnno.filter((e) => e.image === img.id),
    part: {
      id: img.part,
      name: partEntities[img.part]?.name,
    },
    is_relabel: img.isRelabel,
    confidence: img.confidence,
  }));

export const makeLabelImageSelector = (partId) =>
  createSelector([selectImagesByPart(partId), selectPartEntities, selectAllAnno], mapImageToLabelImage);

export const selectRelabelImages = createSelector(
  [selectImagesByRelabel(true), selectPartEntities, selectAllAnno],
  mapImageToLabelImage,
);

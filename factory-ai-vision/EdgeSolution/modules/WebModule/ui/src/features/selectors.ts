import { createSelector } from '@reduxjs/toolkit';
import { selectAllImages } from './imageSlice';
import { selectPartEntities } from './partSlice';
import { selectAllAnno } from './annotationSlice';

export const makeLabelImageSelector = (partId) =>
  createSelector([selectAllImages, selectPartEntities, selectAllAnno], (images, partEntities, allAnno) =>
    images
      .filter((img) => img.part === partId)
      .map((img) => ({
        id: img.id,
        image: img.image,
        labels: allAnno.filter((e) => e.image === img.id),
        part: {
          id: img.part,
          name: partEntities[img.part].name,
        },
        is_relabel: img.isRelabel,
        confidence: 0,
      })),
  );

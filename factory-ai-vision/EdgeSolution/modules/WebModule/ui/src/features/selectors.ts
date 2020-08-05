import { createSelector } from '@reduxjs/toolkit';
import { selectAllImages } from './imageSlice';
import { selectPartEntities } from './partSlice';
import { selectAnnoEntities } from './annotationSlice';

export const makeImageLabelImageSelector = (partId) =>
  createSelector(
    [selectAllImages, selectPartEntities, selectAnnoEntities],
    (images, partEntities, annoEntities) =>
      images
        .filter((img) => img.part === partId)
        .map((img) => ({
          id: img.id,
          image: img.image,
          labels: img.labels.map((e) => annoEntities[e]),
          part: {
            id: img.part,
            name: partEntities[img.part].name,
          },
          is_relabel: img.isRelabel,
          confidence: 0,
        })),
  );

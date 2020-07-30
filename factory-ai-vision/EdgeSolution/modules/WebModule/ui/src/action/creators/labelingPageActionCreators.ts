import { OpenLabelingPage } from '../type';
import { OPEN_LABELING_PAGE } from '../constants';

export const openLabelingPage = (imageIds, selectedImageId): OpenLabelingPage => ({
  type: OPEN_LABELING_PAGE,
  imageIds,
  selectedImageId,
});

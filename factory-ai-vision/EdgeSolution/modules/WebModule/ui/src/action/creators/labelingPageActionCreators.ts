import { OpenLabelingPage, CloseLabelingPage } from '../type';
import { OPEN_LABELING_PAGE, CLOSE_LABELING_PAGE } from '../constants';

export const openLabelingPage = (imageIds, selectedImageId): OpenLabelingPage => ({
  type: OPEN_LABELING_PAGE,
  imageIds,
  selectedImageId,
});

export const closeLabelingPage = (): CloseLabelingPage => ({
  type: CLOSE_LABELING_PAGE,
});

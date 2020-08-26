// Describe the shape of the labelImage's slice of state
export type LabelImage = {
  id: number;
  image: string;
  labels: string;
  part: {
    id: number;
    name: string;
  };
  is_relabel: boolean;
  confidence: number;
  hasRelabeled?: boolean;
};

// Describe the different ACTION NAMES available
export const GET_LABEL_IMAGE_SUCCESS = 'GET_LABEL_IMAGE_SUCCESS';
export const POST_LABEL_IMAGE_SUCCESS = 'POST_LABEL_IMAGE_SUCCESS';
export const DELETE_LABEL_IMAGE_SUCCESS = 'DELETE_LABEL_IMAGE_SUCCESS';
export const REQUEST_LABEL_IMAGE_FAILURE = 'REQUEST_LABEL_IMAGE_FAILURE';
export const UPDATE_LABEL_IMAGE_ANNOTATION = 'UPDATE_LABEL_IMAGE_ANNOTATION';
export const REMOVE_IMAGES_FROM_PART = 'REMOVE_IMAGES_FROM_PART';

export const UPDATE_RELABEL_REQUEST = 'UPDATE_RELABEL_REQUEST';
export const UPDATE_RELABEL_SUCCESS = 'UPDATE_RELABEL_SUCCESS';
export const UPDATE_RELABEL_FAILED = 'UPDATE_RELABEL_FAILED';

export type GetLabelImagesSuccess = { type: typeof GET_LABEL_IMAGE_SUCCESS; payload: LabelImage[] };
export type PostLabelImageSuccess = { type: typeof POST_LABEL_IMAGE_SUCCESS; payload: LabelImage };
export type DeleteLabelImageSuccess = { type: typeof DELETE_LABEL_IMAGE_SUCCESS; payload: { id: number } };
export type RequestLabelImagesFailure = { type: typeof REQUEST_LABEL_IMAGE_FAILURE };
export type UpdateLabelImageAnnotation = {
  type: typeof UPDATE_LABEL_IMAGE_ANNOTATION;
  payload: { id: number; labels: any; part: { id: number; name: string }; hasRelabeled: boolean };
};
export type RemoveImagesFromPartAction = {
  type: typeof REMOVE_IMAGES_FROM_PART;
};

export type UpdateRelabelRequestAction = { type: typeof UPDATE_RELABEL_REQUEST };
export type UpdateRelabelSuccessAction = { type: typeof UPDATE_RELABEL_SUCCESS };
export type UpdateRelabelFailedAction = { type: typeof UPDATE_RELABEL_FAILED };

export type LabelImageAction =
  | GetLabelImagesSuccess
  | PostLabelImageSuccess
  | DeleteLabelImageSuccess
  | RequestLabelImagesFailure
  | UpdateLabelImageAnnotation
  | RemoveImagesFromPartAction
  | UpdateRelabelRequestAction
  | UpdateRelabelSuccessAction
  | UpdateRelabelFailedAction;

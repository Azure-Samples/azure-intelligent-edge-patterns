import * as R from 'ramda';
import { GET_IMAGES_SUCCESS, CAPTURE_IMAGE_SUCCESS } from '../action/constants';
import { ActionTypes } from '../action';
import { changeArrayToMap } from './util';
import { NormalizedState } from './type';

export type Image = {
  id: number;
  image: string;
  part: number;
}

export type NormalizedImage = NormalizedState<Image>;

const initialImages: NormalizedImage = {
  entities: {},
  result: []
}

const normalizeImageShape = (response: any): Image => ({
  id: response.id,
  image: response.image,
  part: response.part,
});

const normalizeImage = R.compose(changeArrayToMap, R.map(normalizeImageShape));

const imagesReducer = (state = initialImages, action: ActionTypes): NormalizedImage => {
  switch (action.type) {
    case GET_IMAGES_SUCCESS:
      return normalizeImage(action.response);
    case CAPTURE_IMAGE_SUCCESS:
      return R.assocPath(['entities', action.response.id], normalizeImageShape(action.response), state);
    default:
      return state;
  }
};

export default imagesReducer;

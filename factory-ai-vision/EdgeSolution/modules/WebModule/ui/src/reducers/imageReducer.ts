import * as R from 'ramda';
import { GET_IMAGES_SUCCESS, CAPTURE_IMAGE_SUCCESS } from '../action/constants';
import { ActionTypes } from '../action';
import { NormalizedState } from './type';

export type Image = {
  id: number;
  image: string;
  part: number;
  labels: string[];
  isRelabel: boolean;
};

export type NormalizedImage = NormalizedState<Image>;

const initialImages: NormalizedImage = { entities: {}, result: [] };

export const normalizeImageShape = (response: any): Image => {
  return {
    id: response.id,
    image: response.image,
    part: response.part,
    labels: response.labels,
    isRelabel: response.is_relabel,
  };
};

const imagesReducer = (state = initialImages, action: ActionTypes): NormalizedImage => {
  switch (action.type) {
    case GET_IMAGES_SUCCESS:
      return {
        entities: action.response.entities.images,
        result: action.response.result,
      };
    case CAPTURE_IMAGE_SUCCESS: {
      const transform = {
        entities: R.assoc(action.response.id, normalizeImageShape(action.response)),
        byPartId: {
          [action.response.part]: R.append(action.response.id),
        },
        notRelabel: R.append(action.response.id) as any,
      };

      return R.evolve(transform, state);
    }
    default:
      return state;
  }
};

export default imagesReducer;

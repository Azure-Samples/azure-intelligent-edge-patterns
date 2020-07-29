import * as R from 'ramda';
import { GET_IMAGES_SUCCESS, CAPTURE_IMAGE_SUCCESS } from '../action/constants';
import { ActionTypes } from '../action';

export type Image = {
  id: number;
  image: string;
  part: number;
};

export type NormalizedImage = {
  entities: Record<string, Image>;
  byPartId: Record<string, number[]>;
  relabel: number[];
  notRelabel: number[];
};

const initialImages: NormalizedImage = { entities: {}, byPartId: {}, relabel: [], notRelabel: [] };

const normalizeImageShape = (response: any): Image => ({
  id: response.id,
  image: response.image,
  part: response.part,
});

function changeArrayToMap(originImages: any): NormalizedImage {
  return originImages.reduce((acc, cur) => {
    acc.entities[cur.id] = cur;
    if (cur.part) {
      if (acc.byPartId[cur.part]) acc.byPartId[cur.part].push(cur.id);
      else acc.byPartId[cur.part] = [cur.id];
    }
    if (cur.is_relabel) acc.relabel.push(cur.id);
    else acc.notRelabel.push(cur.id);
    return acc;
  }, initialImages);
}

const normalizeImage = R.compose(changeArrayToMap, R.map(normalizeImageShape));

const imagesReducer = (state = initialImages, action: ActionTypes): NormalizedImage => {
  switch (action.type) {
    case GET_IMAGES_SUCCESS:
      return normalizeImage(action.response);
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

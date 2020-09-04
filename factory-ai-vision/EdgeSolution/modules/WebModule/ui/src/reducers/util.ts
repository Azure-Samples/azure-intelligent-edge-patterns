import * as R from 'ramda';

import { NormalizedState } from './type';

/**
 * Change domain data from array to map.
 * @param array The domain data array. Need to have property `id`
 */
export function changeArrayToMap<T extends {id: number}>(array: T[]): NormalizedState<T> {
  return array.reduce(
    (acc, cur) => {
      acc.entities[cur.id] = cur;
      acc.result.push(cur.id);
      return acc;
    },
    { entities: {}, result: [] },
  );
}

export function removeStateById<S>(id: number, state: S) {
  const deleteObj = {
    entities: R.omit([id.toString()]),
    result: R.without([id]),
  };
  return R.evolve(deleteObj, state);
}
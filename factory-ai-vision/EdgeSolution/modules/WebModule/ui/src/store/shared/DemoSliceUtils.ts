/**
 * Slices such as camera and training project has the concept of `isDemo`,
 * which means if the project / camera is for the six demo scenarios only.
 */

import {
  EntityState,
  EntityId,
  AnyAction,
  PayloadAction,
  EntitySelectors,
  createSelector,
} from '@reduxjs/toolkit';
import Axios, { AxiosPromise } from 'axios';
import { State } from 'RootStateType';

type DemoStateType = {
  isDemo: boolean;
};

type DemoEntityState<T> = EntityState<T> & { isDemo: EntityId[]; nonDemo: EntityId[] };
export function getInitialDemoState<T>(initialState: EntityState<T>): DemoEntityState<T> {
  return { ...initialState, isDemo: [], nonDemo: [] };
}

type DemoSliceKey = keyof Pick<State, 'camera' | 'trainingProject'>;

/**
 * Insert isDemo, noDemo fields to entity state
 * @param state The state in EntityState shape, and the entity should contain the field `isDemo`
 */
export function insertDemoFields<T extends DemoStateType>(state: DemoEntityState<T>): void {
  const { ids, entities } = state;
  state.isDemo = ids.filter((id) => entities[id].isDemo);
  state.nonDemo = ids.filter((id) => !entities[id].isDemo);
}

export const isCRDAction = (action: AnyAction): action is PayloadAction<any> => {
  return /post|get|delete/.test(action.type);
};

export const getSliceApiByDemo = (sliceName: string, isDemo): AxiosPromise => {
  const url = isDemo ? `/api/${sliceName}/` : `/api/${sliceName}?is_demo=0`;
  return Axios(url);
};

export function getConditionBySlice(sliceKey: DemoSliceKey, state: State, isDemo): boolean {
  return !state[sliceKey].nonDemo.length || (isDemo && !state[sliceKey].isDemo.length);
}

export function getNonDemoSelector<K extends DemoSliceKey>(
  sliceKey: K,
  selectEntities: EntitySelectors<any, any>['selectEntities'],
) {
  const selectNonDemoIds = (s: State) => s[sliceKey].nonDemo;
  return createSelector([selectNonDemoIds, selectEntities], (ids, entities) => {
    return ids.map((id) => entities[id]);
  });
}

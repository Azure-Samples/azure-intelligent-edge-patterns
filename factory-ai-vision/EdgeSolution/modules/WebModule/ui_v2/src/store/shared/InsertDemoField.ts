import { EntityState, EntityId, AnyAction, PayloadAction } from '@reduxjs/toolkit';

type DemoStateType = {
  isDemo: boolean;
};

type DemoEntityState<T> = EntityState<T> & { isDemo: EntityId[]; nonDemo: EntityId[] };
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

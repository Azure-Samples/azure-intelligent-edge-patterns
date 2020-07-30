import { Reducer as ReduxReducer } from 'redux';
import { ActionTypes } from '../action';

export type Reducer<S> = ReduxReducer<S, ActionTypes>;

export type NormalizedState<E, R = number> = { entities: Record<string, E>; result: R[] };

export type Location = {
  id: number;
  name: string;
  description: string;
  projectId?: number;
  is_demo: boolean;
};

export type NormalizedLocation = { entities: Record<string, Location>; result: number[] };

export type Notification = {
  id: number;
  title: string;
  content: string;
  linkTo: string;
  unRead: boolean;
};

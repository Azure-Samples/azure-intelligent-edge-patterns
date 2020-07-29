export type NormalizedState<T> = {entities: Record<string, T>; result: number[]};

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
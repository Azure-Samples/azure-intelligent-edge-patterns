export type Location = {
  id: number;
  name: string;
  description: string;
  projectId?: number;
  is_demo: boolean;
};

export type NormalizedLocation = { entities: Record<string, Location>; result: number[] };

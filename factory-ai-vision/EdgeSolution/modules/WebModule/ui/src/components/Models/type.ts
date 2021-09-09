export type ModelType = 'custom' | 'own' | 'ovms';

export type CreateCustomVisionForm = {
  name: string;
  type: string;
  tags: string[];
  selectedCustomVisionId: string;
};

export type CreateOwnModelForm = {
  name: string;
  endPoint: string;
  labels: string;
};

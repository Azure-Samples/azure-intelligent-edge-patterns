export type ModelType = 'custom' | 'own' | 'ovms';

type Category = 'object' | 'classification';

export type CreateFormType = {
  name: string;
  endPoint: string;
  labels: string;
  selectedCustomVisionId: string;
  tags: string[];
  category: Category;
};

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

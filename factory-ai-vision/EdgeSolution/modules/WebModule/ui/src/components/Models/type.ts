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

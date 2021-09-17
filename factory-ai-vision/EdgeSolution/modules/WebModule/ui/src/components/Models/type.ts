export type ModelType = 'custom' | 'own' | 'ovms';

export type CreateCustomVisionForm = {
  name: string;
  type: 'ObjectDetection' | 'Classification';
  tags: string[];
  selectedCustomVisionId: string;
  classification: 'Multilabel' | 'Multiclass';
};

export type CreateOwnModelForm = {
  name: string;
  endPoint: string;
  labels: string;
};

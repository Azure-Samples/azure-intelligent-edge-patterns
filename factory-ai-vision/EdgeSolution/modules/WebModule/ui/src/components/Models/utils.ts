import { ModelType } from './type';

export const getSource = (type: ModelType): string => {
  if (type === 'custom') return 'Microsoft Custom Vision';
  if (type === 'ovms') return 'Intel';
  return 'Uploaded';
};

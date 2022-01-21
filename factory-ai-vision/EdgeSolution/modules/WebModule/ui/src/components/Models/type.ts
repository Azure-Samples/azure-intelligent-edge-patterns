import { ClassificationType, ProjectType } from '../../store/trainingProjectSlice';
import { TrainStatus } from '../../constant';

export type ModelType = 'custom' | 'own' | 'ovms';

export type CreateCustomVisionForm = {
  name: string;
  type: ProjectType;
  tags: string[];
  selectedCustomVisionId: string;
  classification: ClassificationType;
};

export type CreateOwnModelForm = {
  name: string;
  endPoint: string;
  labels: string;
};

export const NO_LIMIT_TRAIN_STATUS: TrainStatus[] = ['ok', 'Failed', 'Success', 'No change'];

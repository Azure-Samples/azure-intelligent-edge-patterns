import { TrainingProject } from '../../store/trainingProjectSlice';

export const getModel = (id: string, modelList: TrainingProject[]) => {
  const re = /(?<=_).*/;

  const targetId = id.match(re)[0];
  return modelList.find((model) => model.id === parseInt(targetId, 10));
};

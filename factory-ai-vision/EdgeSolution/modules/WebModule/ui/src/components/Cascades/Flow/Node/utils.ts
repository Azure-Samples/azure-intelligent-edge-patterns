import { Connection } from 'react-flow-renderer';

import { TrainingProject } from '../../../../store/trainingProjectSlice';

export const getSourceMetadata = (connect: Connection, model: TrainingProject) =>
  JSON.stringify(model.outputs[connect.sourceHandle].metadata);

export const getTargetMetadata = (connect: Connection, model: TrainingProject) =>
  JSON.stringify(model.inputs[connect.targetHandle].metadata);

type MetaType = { type: string };

export const isValidConnection = (sourceModelMetadata: string, targetModelMetadata: string) => {
  const sourceOutput = JSON.parse(sourceModelMetadata) as MetaType;
  const targetInput = JSON.parse(targetModelMetadata) as MetaType;

  if (sourceOutput.type === targetInput.type) return true;
  return false;
};

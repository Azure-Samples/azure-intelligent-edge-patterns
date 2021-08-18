import { Connection } from 'react-flow-renderer';

import { TrainingProject } from '../../../../store/trainingProjectSlice';

export const getSourceMetadata = (connect: Connection, model: TrainingProject) =>
  JSON.stringify(model.outputs[connect.sourceHandle].metadata);

export const getTargetMetadata = (connect: Connection, model: TrainingProject) =>
  JSON.stringify(model.inputs[connect.targetHandle].metadata);

export const isValidConnection = (sourceModelMetadata: string, targetModelMetadata: string) => {
  console.log('sourceModel', sourceModelMetadata);
  console.log('targetModel', targetModelMetadata);

  // const sourceModel = getModel(connection.source, ModelList);
  // const targetModel = getModel(connection.target, ModelList);

  // return connection.target === 'B';
  return true;
};

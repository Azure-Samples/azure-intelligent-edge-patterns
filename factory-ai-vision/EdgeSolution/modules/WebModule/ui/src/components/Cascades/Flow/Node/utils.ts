import { Connection } from 'react-flow-renderer';

import { TrainingProject, NodeType } from '../../../../store/trainingProjectSlice';

type MetaDataType = {
  type: string;
} | null;

type ValidationNodeType = {
  metadata: MetaDataType;
  nodeType: NodeType;
};

export const getSourceMetadata = (connect: Connection, model: TrainingProject): ValidationNodeType => {
  return {
    metadata: model.outputs[connect.sourceHandle].metadata ?? null,
    nodeType: model.nodeType,
  };
};

export const getTargetMetadata = (connect: Connection, model: TrainingProject): ValidationNodeType => {
  return {
    metadata: model.inputs[connect.targetHandle].metadata ?? null,
    nodeType: model.nodeType,
  };
};

export const isValidConnection = (source: ValidationNodeType, target: ValidationNodeType) => {
  if (source.nodeType === 'sink' || target.nodeType === 'sink') return true;
  if (source.metadata.type === target.metadata.type) return true;

  return false;
};

import { Connection } from 'react-flow-renderer';

import { TrainingProject, NodeType, MetadataType } from '../../../../store/trainingProjectSlice';

type MetaData = {
  type: MetadataType;
  shape: number[];
} | null;

type ValidationNode = {
  metadata: MetaData;
  nodeType: NodeType;
};

export const getSourceMetadata = (connect: Connection, model: TrainingProject): ValidationNode => {
  return {
    metadata: model.outputs[connect.sourceHandle].metadata ?? null,
    nodeType: model.nodeType,
  };
};

export const getTargetMetadata = (connect: Connection, model: TrainingProject): ValidationNode => {
  return {
    metadata: model.inputs[connect.targetHandle].metadata ?? null,
    nodeType: model.nodeType,
  };
};

const nonNegativeNumber = (numberAry: number[]) => numberAry.filter((n) => n > 0);
const isAllMatchShape = (sourceShape: number[], targetShape: number[]) => {
  if (sourceShape.length !== targetShape.length) return false;
  if (!sourceShape.map((shape, i) => shape === targetShape[i]).every((b) => b)) return false;
  return true;
};

const isAllowConnectType = (metaData: MetaData) => {
  const allowType: MetadataType[] = ['bounding_box', 'classification'];
  if (!metaData) return false;

  return allowType.includes(metaData.type);
};

export const isValidConnection = (source: ValidationNode, target: ValidationNode) => {
  // connect export node metadata type has includes: bounding_box,classification
  if (source.nodeType === 'sink' || target.nodeType === 'sink') {
    if (isAllowConnectType(target.metadata) || isAllowConnectType(source.metadata)) {
      return true;
    } else {
      return false;
    }
  }

  // compare type & shape
  if (
    source.metadata.type === target.metadata.type &&
    isAllMatchShape(nonNegativeNumber(source.metadata.shape), nonNegativeNumber(target.metadata.shape))
  )
    return true;

  return false;
};

import { Connection } from 'react-flow-renderer';

import { TrainingProject, MetadataType } from '../../../../store/trainingProjectSlice';
import { ValidationNode, MetaData } from '../../types';

const getSourceMetadata = (connect: Connection, model: TrainingProject): ValidationNode => {
  return {
    metadata: model.outputs[connect.sourceHandle].metadata ?? null,
    nodeType: model.nodeType,
  };
};

const getTargetMetadata = (connect: Connection, model: TrainingProject): ValidationNode => {
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
  const allowType: MetadataType[] = ['bounding_box', 'classification', 'regression'];
  if (!metaData) return false;

  return allowType.includes(metaData.type);
};

export const isValidConnection = (
  sourceModel: TrainingProject,
  targetModel: TrainingProject,
  currentConnection: Connection,
  connectMap: Connection[],
) => {
  if (connectMap.length > 0) {
    const matchConnect = connectMap.find(
      (connect) =>
        connect.target === currentConnection.target &&
        connect.targetHandle === currentConnection.targetHandle,
    );

    if (!!matchConnect) return false;
  }

  const sourceMetadata = getSourceMetadata(currentConnection, sourceModel);
  const targetMetadata = getTargetMetadata(currentConnection, targetModel);

  // connect export node metadata type has includes: bounding_box,classification
  if (sourceMetadata.nodeType === 'sink' || targetMetadata.nodeType === 'sink') {
    if (isAllowConnectType(targetMetadata.metadata) || isAllowConnectType(sourceMetadata.metadata)) {
      return true;
    } else {
      return false;
    }
  }

  // compare type & shape
  if (
    sourceMetadata.metadata.type === targetMetadata.metadata.type &&
    isAllMatchShape(
      nonNegativeNumber(sourceMetadata.metadata.shape),
      nonNegativeNumber(targetMetadata.metadata.shape),
    )
  )
    return true;

  return false;
};

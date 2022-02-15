import { NodeType, MetadataType } from '../../store/trainingProjectSlice';

export type MetaData = {
  type: MetadataType;
  shape: number[];
} | null;

export type ValidationNode = {
  metadata: MetaData;
  nodeType: NodeType;
};

export const LIMIT_OUTPUTS: MetadataType[] = ['classification', 'regression'];

export type CascadeError = '' | 'nodeDuplication' | 'nameDuplication' | 'discreteFlow' | 'atLeastOneExport';

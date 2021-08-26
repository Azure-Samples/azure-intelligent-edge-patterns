import { Node, Edge, isNode, isEdge } from 'react-flow-renderer';

import { TrainingProject, Params, NodeType } from '../../store/trainingProjectSlice';
import { CascadePayload } from '../../store/cascadeSlice';

export const getModel = (id: string, modelList: TrainingProject[]) => {
  if (!id) return;
  const re = /(?<=_).*/;

  const targetId = id.match(re)[0];
  return modelList.find((model) => model.id === parseInt(targetId, 10));
};

export const getConvertNode = (node: Node, modelList: TrainingProject[]) => {
  const matchModel = getModel(node.id, modelList);

  return {
    node_id: node.id,
    name: matchModel.nodeType === 'sink' ? node.data.name : matchModel.name,
    type: node.type,
    inputs: matchModel.inputs,
    outputs: matchModel.outputs,
    openvino_model_name: matchModel.openvino_model_name,
    openvino_library_name: matchModel.openvino_library_name,
    demultiply_count: matchModel.demultiply_count,
    download_uri_openvino: matchModel.download_uri_openvino,
    params:
      matchModel.nodeType === 'openvino_library'
        ? {
            ...(matchModel.params as Params),
            confidence_threshold: (node.data.params.confidence_threshold as number).toString(),
          }
        : matchModel.params,
    combined: matchModel.combined,
  };
};

export const getConvertEdge = (edge: Edge, modelList: TrainingProject[]) => {
  const sourceModel = getModel(edge.source, modelList);
  const targetModel = getModel(edge.target, modelList);

  return {
    source: {
      node_id: edge.source,
      output_name: sourceModel.outputs[parseInt(edge.sourceHandle, 10)].name,
    },
    target: {
      node_id: edge.target,
      input_name: targetModel.inputs[parseInt(edge.targetHandle, 10)].name,
    },
  };
};

export const getCascadePayload = (
  elements: (Node | Edge)[],
  name: string,
  modelList: TrainingProject[],
): CascadePayload => {
  const payload = {
    flow: JSON.stringify({
      name,
      nodes: elements.filter((ele) => isNode(ele)).map((node: Node) => getConvertNode(node, modelList)),
      edges: elements.filter((ele) => isEdge(ele)).map((edge: Edge) => getConvertEdge(edge, modelList)),
    }),
    raw_data: JSON.stringify(elements),
    name,
  };

  return payload;
};

export const getBlobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
};

export const getNodeImage = (type: NodeType) => {
  if (['customvision_model', 'openvino_model'].includes(type)) return '/icons/modelCard.png';
  if (type === 'openvino_library') return '/icons/transformCard.png';
  if (type === 'sink') return '/icons/exportCard.png';
};

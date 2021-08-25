import { Node, Edge, isNode, isEdge } from 'react-flow-renderer';

import { TrainingProject } from '../../store/trainingProjectSlice';
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
    name: matchModel.node_type === 'sink' ? node.data.name : matchModel.name,
    type: node.type,
    inputs: matchModel.inputs,
    outputs: matchModel.outputs,
    openvino_model_name: matchModel.openvino_model_name,
    openvino_library_name: matchModel.openvino_library_name,
    demultiply_count: matchModel.demultiply_count,
    params: matchModel.params,
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

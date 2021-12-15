import { Node, Edge, isNode, isEdge } from 'react-flow-renderer';

import { TrainingProject, Params, NodeType, Handler, ProjectType } from '../../store/trainingProjectSlice';
import { CascadePayload } from '../../store/cascadeSlice';
import { LIMIT_OUTPUTS } from './types';

export const getModelId = (nodeId: string) => {
  const re = /(?<=_).*/;

  return nodeId.match(re)[0];
};

export const getModel = (id: string, modelList: TrainingProject[]) => {
  if (!id) return;

  const nodeId = getModelId(id);
  return modelList.find((model) => model.id === parseInt(nodeId, 10));
};

export const getLimitOutputs = (nodeType: NodeType, outputs: Handler[]) =>
  nodeType === 'openvino_library'
    ? outputs.filter((output) => !LIMIT_OUTPUTS.includes(output.metadata.type))
    : outputs;

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
            filter_label_id: (node.data.params.filter_label_id as number).toString(),
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

export const isDuplicateNodeName = (elements: (Node | Edge)[]) => {
  const exportNameList = elements
    .filter((element) => isNode(element))
    .filter((node) => (node.type as NodeType) === 'sink')
    .map((node) => node.data?.name);

  return new Set(exportNameList).size !== exportNameList.length;
};

export const isNotExportNode = (elements: (Node | Edge)[], modelList: TrainingProject[]) => {
  if (elements.length === 1) return true;

  const exportNodes = elements.find((element) => {
    if (!isNode(element)) return false;

    const selectModel = modelList.find((model) => model.id === +getModelId(element.id));

    if (selectModel.nodeType === 'sink') return true;
    return false;
  }) as Node | undefined;

  return !exportNodes;
};

// FORMAT: id_modelId_(input/output)_handlerIdx_nodeType_outputsCount
const parseHandlerName = (
  name: string,
): {
  id: number;
  modelId: number;
  handlerType: 'input' | 'output';
  handlerId: number;
  nodeType: NodeType;
  projectType: ProjectType;
} => ({
  id: +name.split('_')[0],
  modelId: +name.split('_')[1],
  handlerType: name.split('_')[2] as 'input' | 'output',
  handlerId: +name.split('_')[3],
  nodeType: `${name.split('_')[4]}_${name.split('_')[5]}` as NodeType,
  projectType: name.split('_')[6] as ProjectType,
});

export const isDiscreteFlow = (elements: (Node | Edge)[], modelList: TrainingProject[]) => {
  if (elements.length === 1) return true;

  const allNodes: Node[] = [];
  const allEdges: Edge[] = [];

  elements.forEach((ele) => {
    if (isNode(ele)) {
      allNodes.push(ele);
      return;
    }

    allEdges.push(ele as Edge);
  });

  // id_modelId_(input/output)_handlerIdx_nodeType: number
  const handlerMap: Record<string, number> = allNodes.reduce((accMap, node) => {
    const selectedModel = modelList.find((model) => model.id === +getModelId(node.id));

    const inputMap = selectedModel.inputs.reduce((acc, _, idx) => {
      acc[`${node.id}_input_${idx}_${selectedModel.nodeType}_${selectedModel.projectType}`] = 0;
      return acc;
    }, {});

    const outputMap = getLimitOutputs(selectedModel.nodeType, selectedModel.outputs).reduce((acc, _, idx) => {
      acc[`${node.id}_output_${idx}_${selectedModel.nodeType}_${selectedModel.projectType}`] = 0;
      return acc;
    }, {});

    return {
      ...accMap,
      ...inputMap,
      ...outputMap,
    };
  }, {});

  let flowMap = { ...handlerMap };

  allEdges.forEach((edge: Edge) => {
    const sourceModel = getModel(edge.source, modelList);
    const targetModel = getModel(edge.target, modelList);

    flowMap = {
      ...flowMap,
      [`${edge.target}_input_${edge.targetHandle}_${targetModel.nodeType}_${targetModel.projectType}`]:
        flowMap[
          `${edge.target}_input_${edge.targetHandle}_${targetModel.nodeType}_${targetModel.projectType}`
        ] + 1,
      [`${edge.source}_output_${edge.sourceHandle}_${sourceModel.nodeType}_${sourceModel.projectType}`]:
        flowMap[
          `${edge.source}_output_${edge.sourceHandle}_${sourceModel.nodeType}_${sourceModel.projectType}`
        ] + 1,
    };
  });

  const allCount = Object.keys(flowMap).map((key) => flowMap[key]);

  if (allCount.some((count) => count === 0)) {
    // if some handler don't connect, need to checking nodeType `openvino_library` output handler connect one at least

    const unconnectedHandlerList = Object.keys(flowMap)
      .filter((key) => flowMap[key] === 0)
      .map((name) => parseHandlerName(name));

    const openvinoClassificationModelOutputHandlerList = unconnectedHandlerList.filter(
      (info) =>
        info.handlerType === 'output' &&
        info.nodeType === 'openvino_model' &&
        info.projectType === 'Classification',
    );
    if (openvinoClassificationModelOutputHandlerList.length > 0) {
      // {modelId: unConnect output handler count}
      const unconnnectOpenVinoClassificationOutputHandlerMap: Record<
        number,
        number
      > = openvinoClassificationModelOutputHandlerList.reduce((acc, info) => {
        acc[info.modelId] = acc[info.modelId] ? acc[info.modelId] + 1 : 1;
        return acc;
      }, {});

      const hasConnectOneOutputHandler = Object.keys(unconnnectOpenVinoClassificationOutputHandlerMap).some(
        (modelId) => {
          const model = modelList.find((mode) => mode.id === +modelId);
          return model.outputs.length === unconnnectOpenVinoClassificationOutputHandlerMap[modelId];
        },
      );

      return hasConnectOneOutputHandler;
    }

    if (
      unconnectedHandlerList.find(
        (info) => info.handlerType !== 'output' || info.nodeType !== 'openvino_library',
      )
    )
      return true;

    const unConnectedCropHandler = unconnectedHandlerList.filter(
      (info) => info.handlerType === 'output' && info.nodeType === 'openvino_library',
    );

    const unConnectedCropId = unConnectedCropHandler.reduce((acc, handler) => {
      acc[handler.id] = acc[handler.id] !== undefined ? acc[handler.id] + 1 : 1;
      return acc;
    }, {});

    if (Object.values(unConnectedCropId).every((count) => count === 1)) return false;

    return true;
  }

  // all handler has connect
  return false;
};

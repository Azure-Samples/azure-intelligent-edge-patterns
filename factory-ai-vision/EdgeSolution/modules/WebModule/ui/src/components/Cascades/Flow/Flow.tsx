import React, { useState, useRef, useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  removeElements,
  Controls,
  isNode,
  isEdge,
  Node,
  Edge,
  Connection,
} from 'react-flow-renderer';

import { TrainingProject, NodeType } from '../../../store/trainingProjectSlice';
import { getModel } from '../utils';
import { getFlowClasses } from './styles';

import './dnd.css';

import SidebarList from './Sidebar/SidebarList';
import ModelNode from './Node/ModelNode';
import CustomEdge from './CustomEdge';
import SourceNode from './Node/SourceNode';
import ExportNodeCard from './Node/ExportNode';
import NodePanel from './NodePanel';

interface Props {
  elements: (Node | Edge)[];
  setElements: React.Dispatch<React.SetStateAction<(Node<any> | Edge<any>)[]>>;
  modelList: TrainingProject[];
  flowElementRef: React.MutableRefObject<any>;
}

const getNodeId = (modeId: string, length: number) => `${length++}_${modeId}`;

const getNodeParams = (modelId: string, modelList: TrainingProject[]) => {
  const model = modelList.find((model) => model.id === parseInt(modelId, 10));
  return model.params;
};

const getSourceMetadata = (
  selectedNode: Node,
  elements: (Node<any> | Edge<any>)[],
  modelList: TrainingProject[],
) => {
  if (!selectedNode) return [];
  if ((selectedNode.type as NodeType) !== 'openvino_library') return [];

  const matchModels = elements
    .filter((ele) => isEdge(ele))
    .filter((edge: Edge<any>) => edge.target === selectedNode.id)
    .map((edge: Edge<any>) => getModel(edge.source, modelList))
    .map((model: TrainingProject) => model.outputs.find((output) => output.metadata.type === 'bounding_box'))
    .filter((model) => !!model);

  if (matchModels.length === 0) return [];
  return matchModels[0].metadata.labels;
};

const DnDFlow = (props: Props) => {
  const { elements, setElements, modelList, flowElementRef } = props;

  const classes = getFlowClasses();

  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  const onElementsRemove = (elementsToRemove) => setElements((els) => removeElements(elementsToRemove, els));
  const onLoad = (_reactFlowInstance) => setReactFlowInstance(_reactFlowInstance);

  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (event) => {
    event.preventDefault();

    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const type = event.dataTransfer.getData('application/reactflow') as NodeType;
    const id = event.dataTransfer.getData('id');
    const connectMap = event.dataTransfer.getData('connectMap');

    const position = reactFlowInstance.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });

    setElements((es) => {
      return es.concat({
        id: getNodeId(id, es.length),
        type,
        position,
        data: {
          id,
          name: type === 'sink' ? 'Export' : null,
          params: getNodeParams(id, modelList),
          connectMap: JSON.parse(connectMap),
        },
      });
    });
  };

  /**
   * connectMap is manual add in node card, if want to delete Node, Edge, had edge Node
   * need to update every node card connectMap
   */

  const onDeleteNode = useCallback(
    (nodeId: string) => {
      setElements((prev) => {
        const deletedNode = prev.find((element) => isNode(element) && element.id === nodeId) as Node;
        const connectMap = prev[0].data.connectMap as Connection[];

        const newConnectMap = connectMap.filter(
          (connect) => connect.source !== deletedNode.id && connect.target !== deletedNode.id,
        );

        const newPrev: (Node<any> | Edge<any>)[] = [];

        prev.forEach((element) => {
          if (element.id === deletedNode.id) return;
          if (isEdge(element) && [element.source, element.target].includes(nodeId)) return;

          newPrev.push({ ...element, data: { ...element.data, connectMap: newConnectMap } });
        });

        return newPrev;
      });
    },
    [setElements],
  );

  /**
   * connectMap is manual add in node card, if want to delete Node, Edge, had edge Node
   * need to update every node card connectMap
   */
  const onDeleteEdge = useCallback(
    (edgeId: string) => {
      setElements((prev) => {
        const deletedEdgeIndex = prev.findIndex((element) => isEdge(element) && element.id === edgeId);
        const deletedEdge = prev[deletedEdgeIndex] as Edge;

        prev.splice(deletedEdgeIndex, 1);
        const adjustedConnectMapElements = prev.map((element) => {
          if (isNode(element)) {
            const newConnectMap = (element.data.connectMap as Connection[]).filter(
              (connect) =>
                connect.source !== deletedEdge.source &&
                connect.sourceHandle !== deletedEdge.sourceHandle &&
                connect.target !== deletedEdge.target &&
                connect.targetHandle !== deletedEdge.targetHandle,
            );

            return {
              ...element,
              data: { ...element.data, connectMap: newConnectMap },
            };
          }

          return element;
        });

        return adjustedConnectMapElements;
      });
    },
    [setElements],
  );

  return (
    <div className="dndflow">
      <ReactFlowProvider>
        <SidebarList
          modelList={modelList}
          connectMap={elements.length > 0 ? elements[0].data?.connectMap : []}
        />
        <div className="reactflow-wrapper" ref={reactFlowWrapper}>
          <NodePanel
            selectedNode={selectedNode}
            setSelectedNode={setSelectedNode}
            model={selectedNode && getModel(selectedNode?.id, modelList)}
            setElements={setElements}
            matchTargetLabels={getSourceMetadata(selectedNode, elements, modelList)}
          />
          <ReactFlow
            className={classes.flow}
            ref={flowElementRef}
            elements={elements}
            nodeTypes={{
              source: (node: Node) => {
                const { data } = node;

                return (
                  <SourceNode
                    id={data.id}
                    setElements={setElements}
                    modelList={modelList}
                    connectMap={data.connectMap}
                  />
                );
              },
              openvino_model: (node: Node) => {
                const { id, data } = node;

                return (
                  <ModelNode
                    id={data.id}
                    modelList={modelList}
                    type="openvino_model"
                    setElements={setElements}
                    onDelete={() => onDeleteNode(id)}
                    onSelected={() => setSelectedNode(node)}
                    connectMap={data.connectMap}
                  />
                );
              },
              customvision_model: (node: Node) => {
                const { id, data } = node;

                return (
                  <ModelNode
                    id={data.id}
                    modelList={modelList}
                    type="customvision_model"
                    setElements={setElements}
                    onDelete={() => onDeleteNode(id)}
                    onSelected={() => setSelectedNode(node)}
                    connectMap={data.connectMap}
                  />
                );
              },
              openvino_library: (node: Node) => {
                const { id, data } = node;

                return (
                  <ModelNode
                    id={data.id}
                    modelList={modelList}
                    type="openvino_library"
                    setElements={setElements}
                    onDelete={() => onDeleteNode(id)}
                    onSelected={() => setSelectedNode(node)}
                    connectMap={data.connectMap}
                  />
                );
              },
              sink: (node: Node) => {
                const { id, data } = node;

                return (
                  <ExportNodeCard
                    data={data}
                    setElements={setElements}
                    onDelete={() => onDeleteNode(id)}
                    onSelected={() => setSelectedNode(node)}
                    modelList={modelList}
                    connectMap={data.connectMap}
                  />
                );
              },
            }}
            edgeTypes={{
              default: (edge) => {
                return <CustomEdge {...edge} onDeleteEdge={(edgeId: string) => onDeleteEdge(edgeId)} />;
              },
            }}
            onElementsRemove={onElementsRemove}
            onLoad={onLoad}
            onDrop={onDrop}
            onDragOver={onDragOver}
            snapToGrid={true}
          >
            <Controls />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </div>
  );
};

export default DnDFlow;

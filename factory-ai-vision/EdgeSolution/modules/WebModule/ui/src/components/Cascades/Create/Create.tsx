import React, { useState, useRef, useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  removeElements,
  Controls,
  Handle,
  getConnectedEdges,
  isNode,
  isEdge,
  Node,
  Edge,
} from 'react-flow-renderer';
import { useSelector } from 'react-redux';

import { trainingProjectIsCascadesFactory } from '../../../store/trainingProjectSlice';

import './dnd.css';

import Sidebar from './Sidebar';
import NodeCard from './Node/Node';
import CustomEdge from './CustomEdge';
import InitialNode from './Node/InitialNode';

interface Props {
  elements: (Node | Edge)[];
  setElements: React.Dispatch<React.SetStateAction<(Node<any> | Edge<any>)[]>>;
}

let id = 1;
const getNodeId = () => `${id++}`;

const isValidConnection = (connection) => {
  console.log('connection', connection);

  return connection.target === 'dndnode_2';
  // return true;
};

// const nodeTypes = ;

const edgeTypes = {
  customEdge: CustomEdge,
};

const DnDFlow = (props: Props) => {
  const { elements, setElements } = props;

  const trainingProjectIsPredictionModelSelector = trainingProjectIsCascadesFactory();
  const trainingProjectList = useSelector(trainingProjectIsPredictionModelSelector);

  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  // const [elements, setElements] = useState<(Node | Edge)[]>(initialElements);

  // @ts-ignore
  const onConnect = (params) => {
    console.log('params', params);

    // @ts-ignore
    setElements((els) => {
      console.log('els', els);

      return addEdge(params, els);
    });
  };
  // const onConnect = (params) =>
  //   setElements((els) => addEdge({ ...params, type: 'buttonedge' }, els));
  // @ts-ignore
  const onElementsRemove = (elementsToRemove) => setElements((els) => removeElements(elementsToRemove, els));

  const onLoad = (_reactFlowInstance) => setReactFlowInstance(_reactFlowInstance);

  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (event) => {
    event.preventDefault();

    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const type = event.dataTransfer.getData('application/reactflow');
    const id = event.dataTransfer.getData('id');

    // console.log('type', type);

    const position = reactFlowInstance.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });

    const newNode = {
      id: getNodeId(),
      type,
      position,
      // category: cardCategory,
      data: {
        id,
      },
    };

    // @ts-ignore
    setElements((es) => es.concat(newNode));
  };

  const onDeleteNode = useCallback((nodeId: string) => {
    setElements((prev) => {
      const noRemoveNodes = prev.filter((ele) => isNode(ele)).filter((ele) => ele.id !== nodeId) as Node[];

      const allEdges = prev.filter((ele) => isEdge(ele)) as Edge[];
      const noRemoveEdges = allEdges.filter((edge) => ![edge.target, edge.source].includes(nodeId));

      return [...noRemoveNodes, ...noRemoveEdges];
    });
  }, []);

  console.log('elements', elements);

  // const onConnect = (params) => setElements((els) => addEdge(params, els));

  return (
    <div className="dndflow">
      <ReactFlowProvider>
        <Sidebar trainingProjectList={trainingProjectList} />
        <div className="reactflow-wrapper" ref={reactFlowWrapper}>
          <ReactFlow
            elements={elements}
            nodeTypes={{
              initial: () => (
                <>
                  <InitialNode />
                  <Handle
                    type="source"
                    // @ts-ignore
                    position="bottom"
                    // @ts-ignore
                    onConnect={(params) => setElements((els) => addEdge(params, els))}
                  />
                </>
              ),
              model: (node) => {
                const {
                  id,
                  data: { id: modelId },
                } = node;

                return (
                  <NodeCard
                    modelId={modelId}
                    type="model"
                    setElements={setElements}
                    onDelete={() => onDeleteNode(id)}
                  />
                );
              },
              custom: (node) => {
                console.log('custom', node);

                const {
                  id,
                  data: { id: modelId },
                } = node;

                return (
                  <NodeCard
                    modelId={modelId}
                    type="custom"
                    setElements={setElements}
                    onDelete={() => onDeleteNode(id)}
                  />
                );
              },
              export: (node) => {
                console.log('export', node);
                const {
                  id,
                  data: { id: modelId },
                } = node;

                return (
                  <NodeCard
                    modelId={modelId}
                    type="export"
                    setElements={setElements}
                    onDelete={() => onDeleteNode(id)}
                  />
                );
              },
            }}
            edgeTypes={edgeTypes}
            // onConnect={onConnect}
            onElementsRemove={onElementsRemove}
            onLoad={onLoad}
            onDrop={onDrop}
            onDragOver={onDragOver}
          >
            <Controls />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </div>
  );
};

export default DnDFlow;

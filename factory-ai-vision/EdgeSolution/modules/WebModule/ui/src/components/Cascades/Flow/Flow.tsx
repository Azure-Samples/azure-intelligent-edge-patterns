import React, { useState, useRef, useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  removeElements,
  Controls,
  isNode,
  isEdge,
  Node,
  Edge,
} from 'react-flow-renderer';
import { useSelector } from 'react-redux';

import {
  trainingProjectIsCascadesFactory,
  TrainingProject,
  NodeType,
  Params,
} from '../../../store/trainingProjectSlice';
import { getModel } from '../utils';

import './dnd.css';

import Sidebar from './Sidebar';
import NodeCard from './Node/Node';
import CustomEdge from './CustomEdge';
import InitialNode from './Node/SourceNode';
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

const edgeTypes = {
  default: CustomEdge,
};

const DnDFlow = (props: Props) => {
  const { elements, setElements, modelList, flowElementRef } = props;

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

    const position = reactFlowInstance.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });

    setElements((es) =>
      es.concat({
        id: getNodeId(id, es.length),
        type,
        position,
        data: {
          id,
          name: type === 'sink' ? 'export.json' : null,
          params: getNodeParams(id, modelList),
        },
      }),
    );
  };

  const onDeleteNode = useCallback(
    (nodeId: string) => {
      setElements((prev) => {
        const noRemoveNodes = prev.filter((ele) => isNode(ele)).filter((ele) => ele.id !== nodeId) as Node[];

        const allEdges = prev.filter((ele) => isEdge(ele)) as Edge[];
        const noRemoveEdges = allEdges.filter((edge) => ![edge.target, edge.source].includes(nodeId));

        return [...noRemoveNodes, ...noRemoveEdges];
      });
    },
    [setElements],
  );

  // const onCreateImage = useCallback(async () => {
  //   const blob = await domtoimage.toBlob(flowElementRef.current);

  //   setDataUrl(blob);
  //   console.log('blob', blob);

  //   // console.log('test', test);
  // }, []);

  // const onSaveCascades = useCallback(async () => {
  //   await dispatch(createCascade(getCreateCascadePayload(elements, cascadesName, modelList)));

  //   history.push(Url.CASCADES);
  // }, [dispatch, elements, cascadesName, history, modelList]);

  // const commandBarItems: ICommandBarItemProps[] = useMemo(() => {
  //   const items = [
  //     {
  //       key: 'addBtn',
  //       text: 'Add',
  //       iconProps: {
  //         iconName: 'Add',
  //       },
  //       // onClick: onSaveCascades,
  //       onClick: onSaveCascades,
  //     },
  //     ...defaultCommandBarItems,
  //   ];

  //   return items;
  // }, [defaultCommandBarItems]);

  return (
    <>
      <div className="dndflow">
        <ReactFlowProvider>
          <Sidebar modelList={modelList} />
          <div className="reactflow-wrapper" ref={reactFlowWrapper}>
            <NodePanel
              selectedNode={selectedNode}
              setSelectedNode={setSelectedNode}
              model={selectedNode && getModel(selectedNode?.id, modelList)}
              setElements={setElements}
            />
            <ReactFlow
              ref={flowElementRef}
              elements={elements}
              nodeTypes={{
                source: (node) => {
                  const { id } = node;

                  return <InitialNode id={id} setElements={setElements} modelList={modelList} />;
                },
                openvino_model: (node) => {
                  const { id } = node;

                  return (
                    <NodeCard
                      id={id}
                      modelList={modelList}
                      type="openvino_model"
                      setElements={setElements}
                      onDelete={() => onDeleteNode(id)}
                      onSelected={() => setSelectedNode(node)}
                    />
                  );
                },
                customvision_model: (node) => {
                  const { id } = node;

                  return (
                    <NodeCard
                      id={id}
                      modelList={modelList}
                      type="customvision_model"
                      setElements={setElements}
                      onDelete={() => onDeleteNode(id)}
                      onSelected={() => setSelectedNode(node)}
                    />
                  );
                },
                openvino_library: (node) => {
                  const { id } = node;

                  return (
                    <NodeCard
                      id={id}
                      modelList={modelList}
                      type="openvino_library"
                      setElements={setElements}
                      onDelete={() => onDeleteNode(id)}
                      onSelected={() => setSelectedNode(node)}
                    />
                  );
                },
                sink: (node) => {
                  const { id, data } = node;

                  return (
                    <ExportNodeCard
                      id={id}
                      data={data}
                      setElements={setElements}
                      onDelete={() => onDeleteNode(id)}
                      onSelected={() => setSelectedNode(node)}
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
    </>
  );
};

export default DnDFlow;

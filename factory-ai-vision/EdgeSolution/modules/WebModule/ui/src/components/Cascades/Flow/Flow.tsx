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

import { trainingProjectIsCascadesFactory, TrainingProject } from '../../../store/trainingProjectSlice';

import './dnd.css';

import Sidebar from './Sidebar';
import NodeCard from './Node/Node';
import CustomEdge from './CustomEdge';
import InitialNode from './Node/SourceNode';

interface Props {
  elements: (Node | Edge)[];
  setElements: React.Dispatch<React.SetStateAction<(Node<any> | Edge<any>)[]>>;
  modelList: TrainingProject[];
}

const getNodeId = (modeId: string, length: number) => `${length++}_${modeId}`;

const edgeTypes = {
  customEdge: CustomEdge,
};

const DnDFlow = (props: Props) => {
  const { elements, setElements, modelList } = props;

  const trainingProjectList = useSelector(trainingProjectIsCascadesFactory());

  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

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
          <Sidebar trainingProjectList={trainingProjectList} />
          <div className="reactflow-wrapper" ref={reactFlowWrapper}>
            <ReactFlow
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
                    />
                  );
                },
                sink: (node) => {
                  const { id } = node;

                  return (
                    <NodeCard
                      id={id}
                      modelList={modelList}
                      type="sink"
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
    </>
  );
};

export default DnDFlow;

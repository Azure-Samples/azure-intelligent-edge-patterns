import React, { useState, useEffect, useCallback } from 'react';
import { CommandBar, ICommandBarItemProps } from '@fluentui/react';
import { useHistory } from 'react-router-dom';
import { Node, Edge } from 'react-flow-renderer';
import { useDispatch } from 'react-redux';

import { Url } from '../../enums';
import { NodeType, TrainingProject } from '../../store/trainingProjectSlice';
import { getCascadePayload } from './utils';
import { createCascade } from '../../store/cascadeSlice';

import DnDFlow from './Flow/Flow';

interface Props {
  modelList: TrainingProject[];
  cascadeName: string;
  defaultCommandBarItems: ICommandBarItemProps[];
}

const getSourceElements = (modelList: TrainingProject[]) => {
  const sourceNode = modelList.find((model) => model.node_type === 'source');

  return [
    {
      id: `0_${sourceNode.id}`,
      type: 'source' as NodeType,
      data: { id: sourceNode.id },
      position: { x: 350, y: 50 },
    },
  ];
};

const CascadeCreate = (props: Props) => {
  const { modelList, cascadeName, defaultCommandBarItems } = props;

  const [elements, setElements] = useState<(Node | Edge)[]>([]);

  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    if (modelList.length === 0) return;

    setElements(getSourceElements(modelList));
  }, [modelList]);

  const onCreateNewCascade = useCallback(async () => {
    await dispatch(createCascade(getCascadePayload(elements, cascadeName, modelList)));

    history.push(Url.CASCADES);
  }, [dispatch, elements, cascadeName, history, modelList]);

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'addBtn',
      text: 'Add',
      iconProps: {
        iconName: 'Add',
      },
      onClick: () => {
        onCreateNewCascade();
      },
    },
    ...defaultCommandBarItems,
  ];

  return (
    <>
      <CommandBar styles={{ root: { marginTop: '24px' } }} items={commandBarItems} />
      <DnDFlow elements={elements} setElements={setElements} modelList={modelList} />
    </>
  );
};

export default CascadeCreate;

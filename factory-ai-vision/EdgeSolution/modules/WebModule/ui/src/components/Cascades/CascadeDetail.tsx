import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Node, Edge } from 'react-flow-renderer';
import { CommandBar, ICommandBarItemProps } from '@fluentui/react';

import { Url } from '../../enums';
import { TrainingProject } from '../../store/trainingProjectSlice';
import { Cascade } from '../../store/cascadeSlice';
import { getCascadePayload } from './utils';
import { updateCascade } from '../../store/cascadeSlice';

import Flow from './Flow/Flow';

interface Props {
  cascadeList: Cascade[];
  modelList: TrainingProject[];
  defaultCommandBarItems: ICommandBarItemProps[];
  cascadeName: string;
  setCascadeName: React.Dispatch<React.SetStateAction<string>>;
}

const CascadeDetail = (props: Props) => {
  const { cascadeList, modelList, defaultCommandBarItems, cascadeName, setCascadeName } = props;

  const { id } = useParams<{ id: string }>();
  const [elements, setElements] = useState<(Node | Edge)[]>([]);

  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    if (cascadeList.length === 0) return;

    const selectedCascade = cascadeList.find((cascade) => cascade.id === parseInt(id, 10));
    setCascadeName(selectedCascade.name);
    setElements(JSON.parse(selectedCascade.raw_data));
  }, [id, cascadeList, setElements, setCascadeName]);

  const onSaveCascade = useCallback(() => {
    dispatch(
      updateCascade({
        id: parseInt(id, 10),
        data: getCascadePayload(elements, cascadeName, modelList),
      }),
    );

    history.push(Url.CASCADES);
  }, [dispatch, elements, cascadeName, modelList, id, history]);

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'addBtn',
      text: 'Save',
      iconProps: {
        iconName: 'Save',
      },
      onClick: () => {
        onSaveCascade();
      },
    },
    ...defaultCommandBarItems,
  ];

  return (
    <>
      <CommandBar styles={{ root: { marginTop: '24px' } }} items={commandBarItems} />
      <Flow elements={elements} setElements={setElements} modelList={modelList} />
    </>
  );
};

export default CascadeDetail;

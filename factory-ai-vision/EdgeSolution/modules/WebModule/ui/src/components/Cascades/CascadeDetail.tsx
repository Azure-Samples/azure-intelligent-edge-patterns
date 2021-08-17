import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Node, Edge } from 'react-flow-renderer';

import { State as RootState } from 'RootStateType';
import { Cascade } from '../../store/cascadeSlice';
import { TrainingProject } from '../../store/trainingProjectSlice';
import { selectCascadeById } from '../../store/cascadeSlice';

import CascadeCreate from './Create/Create';

interface Props {
  elements: (Node | Edge)[];
  setElements: React.Dispatch<React.SetStateAction<(Node<any> | Edge<any>)[]>>;
  modelList: TrainingProject[];
}

const CascadeDetail = (props: Props) => {
  const { elements, setElements, modelList } = props;

  // const [elements, setElements] = useState<(Node | Edge)[]>([]);

  const { id } = useParams<{ id: string }>();
  const cascade = useSelector((state: RootState) => selectCascadeById(state, id));

  useEffect(() => {
    if (cascade) {
      setElements(JSON.parse(cascade.raw_data));
    }
  }, [cascade, setElements]);

  // console.log('id', id);
  // console.log('cascade', cascade);
  // console.log('elements', elements);

  return <CascadeCreate elements={elements} setElements={setElements} modelList={modelList} />;
};

export default CascadeDetail;

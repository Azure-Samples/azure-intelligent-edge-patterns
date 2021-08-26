import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CommandBar, ICommandBarItemProps, Stack, Label, IconButton } from '@fluentui/react';
import { useHistory } from 'react-router-dom';
import { Node, Edge } from 'react-flow-renderer';
import { useDispatch } from 'react-redux';
import domtoimage from 'dom-to-image';

import { Url } from '../../enums';
import { NodeType, TrainingProject } from '../../store/trainingProjectSlice';
import { getCascadePayload, getBlobToBase64 } from './utils';
import { createCascade } from '../../store/cascadeSlice';

import DnDFlow from './Flow/Flow';
import NameModal from './NameModal';

interface Props {
  modelList: TrainingProject[];
  defaultCommandBarItems: ICommandBarItemProps[];
}

const getSourceElements = (modelList: TrainingProject[]) => {
  const sourceNode = modelList.find((model) => model.nodeType === 'source');

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
  const { modelList, defaultCommandBarItems } = props;

  const [elements, setElements] = useState<(Node | Edge)[]>([]);
  const [cascadeName, setCascadeName] = useState('Default Cascade');
  const [isPopup, setIsPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const flowElementRef = useRef(null);
  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    if (modelList.length === 0) return;

    setElements(getSourceElements(modelList));
  }, [modelList]);

  const onCreateNewCascade = useCallback(async () => {
    setIsLoading(true);

    const blob = await domtoimage.toBlob(flowElementRef.current);
    const base64Screenshot = await getBlobToBase64(blob);

    await dispatch(
      createCascade({
        ...getCascadePayload(elements, cascadeName, modelList),
        screenshot: base64Screenshot,
      }),
    );

    setIsLoading(false);

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
      disabled: isLoading,
    },
    ...defaultCommandBarItems,
  ];

  return (
    <>
      <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 8 }}>
        <Label styles={{ root: { fontSize: '18px', lineHeight: '24px', paddingLeft: '24px' } }}>
          {cascadeName}
        </Label>
        <IconButton
          iconProps={{ iconName: 'Edit' }}
          onClick={() => setIsPopup(true)}
          styles={{ icon: { fontSize: '12px', color: '#323130' } }}
        />
      </Stack>
      <CommandBar styles={{ root: { marginTop: '24px' } }} items={commandBarItems} />
      <DnDFlow
        elements={elements}
        setElements={setElements}
        modelList={modelList}
        flowElementRef={flowElementRef}
      />
      {isPopup && (
        <NameModal
          onClose={() => setIsPopup(false)}
          cascadeName={cascadeName}
          onSave={(name) => setCascadeName(name)}
        />
      )}
    </>
  );
};

export default CascadeCreate;

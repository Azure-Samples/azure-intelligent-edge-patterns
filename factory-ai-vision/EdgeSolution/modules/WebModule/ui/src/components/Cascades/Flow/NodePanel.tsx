import React, { useCallback, useState, useEffect } from 'react';
import { Node, Edge } from 'react-flow-renderer';
import {
  Panel,
  LayerHost,
  Stack,
  PrimaryButton,
  DefaultButton,
  TextField,
  Dropdown,
  Label,
  Text,
  IDropdownOption,
} from '@fluentui/react';

import { NodeType, TrainingProject } from '../../../store/trainingProjectSlice';

interface Props {
  selectedNode: Node;
  setSelectedNode: React.Dispatch<any>;
  model: TrainingProject | null;
  setElements: React.Dispatch<React.SetStateAction<(Node<any> | Edge<any>)[]>>;
}

const MAIN_LAYER_HOST_ID = 'testLayer';

const getPanelTitle = (type: NodeType) => {
  if (type === 'openvino_library') return 'Transform';
  if (type === 'sink') return 'Export';
  return 'Model';
};

const NodePanel = (props: Props) => {
  const { selectedNode, setSelectedNode, model, setElements } = props;

  const [exportName, setExportName] = useState(selectedNode?.data.name);
  const [type, setType] = useState('crop');
  const [tags, setTags] = useState(['car']);

  useEffect(() => {
    setExportName(selectedNode?.data.name);
  }, [selectedNode]);

  const tagsOptions: IDropdownOption[] = [
    { key: 'car', text: 'Car' },
    { key: 'bus', text: 'Bus' },
    { key: 'person', text: 'Person' },
  ];
  const typeOptions: IDropdownOption[] = [{ key: 'crop', text: 'Crop' }];

  const onNameChange = useCallback((value: string) => {
    setExportName(value);
  }, []);

  const onSaveExport = useCallback(() => {
    setElements((prev) => {
      const node = prev.find((element) => element.id === selectedNode.id);
      const newNode = { ...node, data: { ...node.data, name: exportName } };
      const newElements = prev.filter((element) => element.id !== selectedNode.id);

      return [...newElements, newNode];
    });

    setSelectedNode(null);
  }, [exportName, setElements]);

  if (!selectedNode) return <></>;

  return (
    <>
      {selectedNode && (
        <LayerHost
          id={MAIN_LAYER_HOST_ID}
          style={{
            position: 'absolute',
            height: '100%',
            width: '100%',
            top: 0,
            left: 0,
          }}
        />
      )}
      <Panel
        styles={{ root: { zIndex: 10 } }}
        isOpen={!!selectedNode}
        onDismiss={() => setSelectedNode(null)}
        hasCloseButton={true}
        onOuterClick={() => {}}
        layerProps={{
          hostId: MAIN_LAYER_HOST_ID,
        }}
        isFooterAtBottom
        headerText={getPanelTitle(selectedNode.type as NodeType)}
        onRenderFooterContent={() => (
          <Stack tokens={{ childrenGap: 10 }} horizontal>
            {(selectedNode.type as NodeType) === 'openvino_model' && <PrimaryButton text="Go to Models" />}
            {(selectedNode.type as NodeType) === 'openvino_library' && <PrimaryButton text="Save" />}
            {(selectedNode.type as NodeType) === 'sink' && (
              <PrimaryButton text="Save" onClick={onSaveExport} />
            )}
            <DefaultButton text="Cancel" onClick={() => setSelectedNode(null)} />
          </Stack>
        )}
      >
        {(selectedNode.type as NodeType) === 'openvino_model' && (
          <Stack tokens={{ childrenGap: 7 }}>
            <Stack>
              <Label>Name</Label>
              <Text>{model.name}</Text>
            </Stack>
            <Stack>
              <Label>Type</Label>
              <Text>{model.projectType}</Text>
            </Stack>
            <Stack>
              <Label>Source</Label>
              <Text>Intel</Text>
            </Stack>
            <Stack>
              <Label>Objects / Tags</Label>
              <Stack horizontal tokens={{ childrenGap: 6 }}>
                {['Red', 'Blue', 'Green'].map((tag) => (
                  <Stack
                    style={{
                      backgroundColor: 'rgba(0, 137, 250, 0.15)',
                      fontSize: '13px',
                      lineHeight: '18px',
                      padding: '3px 8px',
                      borderRadius: '2px',
                    }}
                  >
                    {tag}
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </Stack>
        )}
        {(selectedNode.type as NodeType) === 'openvino_library' && (
          <Stack tokens={{ childrenGap: 20 }}>
            <Dropdown label="Type" options={typeOptions} selectedKey={type} required disabled />
            <Dropdown label="Objects / Tags" options={tagsOptions} selectedKeys={tags} multiSelect required />
          </Stack>
        )}
        {(selectedNode.type as NodeType) === 'sink' && (
          <Stack tokens={{ childrenGap: 20 }}>
            <TextField
              label="Name"
              value={exportName}
              // errorMessage={formData.name.errMsg}
              onChange={(_, value: string) => onNameChange(value)}
              required
            />
            <Dropdown label="Objects / Tags" options={tagsOptions} selectedKeys={tags} multiSelect required />
          </Stack>
        )}
      </Panel>
    </>
  );
};

export default NodePanel;

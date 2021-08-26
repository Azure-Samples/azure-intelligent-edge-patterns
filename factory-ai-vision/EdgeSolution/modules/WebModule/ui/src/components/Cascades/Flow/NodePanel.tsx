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
import { isNil, isEmpty } from 'ramda';

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

const isThreshold = (threshold) => {
  if (+threshold !== parseInt(threshold, 10)) return false;
  if (threshold > 100 || threshold < 0) return false;
  return true;
};

const isExportName = (name: string) => {
  console.log('exportName', name);
  if (isNil(name) || isEmpty(name)) return false;

  return true;
};

const NodePanel = (props: Props) => {
  const { selectedNode, setSelectedNode, model, setElements } = props;

  const [exportName, setExportName] = useState<string>(null);
  const [threshold, setThreshold] = useState(null);
  const [type, setType] = useState('crop');
  const [tags, setTags] = useState('car');

  useEffect(() => {
    setExportName(selectedNode?.data.name);

    setThreshold(+selectedNode?.data.params.confidence_threshold * 100);
  }, [selectedNode]);

  console.log('threshold', threshold);

  const tagsOptions: IDropdownOption[] = [
    { key: 'car', text: 'Car' },
    { key: 'bus', text: 'Bus' },
    { key: 'person', text: 'Person' },
  ];
  const typeOptions: IDropdownOption[] = [{ key: 'crop', text: 'Crop' }];

  const onNameChange = useCallback((value: string) => {
    setExportName(value);
  }, []);

  const onSaveTransformNode = useCallback(() => {
    setElements((prev) => {
      const node = prev.find((element) => element.id === selectedNode.id);
      const newNode = {
        ...node,
        data: { ...node.data, params: { ...node.data.params, confidence_threshold: threshold / 100 } },
      };
      const newElements = prev.filter((element) => element.id !== selectedNode.id);

      return [...newElements, newNode];
    });

    setSelectedNode(null);
  }, [setElements, selectedNode, setSelectedNode, threshold]);

  const onSaveExportNode = useCallback(() => {
    setElements((prev) => {
      const node = prev.find((element) => element.id === selectedNode.id);
      const newNode = { ...node, data: { ...node.data, name: exportName } };
      const newElements = prev.filter((element) => element.id !== selectedNode.id);

      return [...newElements, newNode];
    });

    setSelectedNode(null);
  }, [exportName, setElements, selectedNode, setSelectedNode]);

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
            {(selectedNode.type as NodeType) === 'openvino_library' && (
              <PrimaryButton text="Save" onClick={onSaveTransformNode} disabled={!isThreshold(threshold)} />
            )}
            {(selectedNode.type as NodeType) === 'sink' && (
              <PrimaryButton text="Save" onClick={onSaveExportNode} disabled={!isExportName(exportName)} />
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
                {['Red', 'Blue', 'Green'].map((tag, i) => (
                  <Stack
                    key={i}
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
            <Dropdown
              label="Objects / Tags"
              options={tagsOptions}
              selectedKey={tags}
              onChange={(_, options) => setTags(options.key as string)}
              required
            />
            <TextField
              label="Confidence Threshold"
              onChange={(_, value) => setThreshold(value)}
              value={threshold}
              required
              errorMessage={!isThreshold(threshold) && '0 ~ 100'}
            />
          </Stack>
        )}
        {(selectedNode.type as NodeType) === 'sink' && (
          <Stack tokens={{ childrenGap: 20 }}>
            <TextField
              label="Name"
              value={exportName}
              onChange={(_, value: string) => onNameChange(value)}
              required
              errorMessage={!isExportName(exportName) && 'Not null'}
            />
            <Dropdown
              label="Objects / Tags"
              options={tagsOptions}
              selectedKey={tags}
              onChange={(_, options) => setTags(options.key as string)}
              required
            />
          </Stack>
        )}
      </Panel>
    </>
  );
};

export default NodePanel;

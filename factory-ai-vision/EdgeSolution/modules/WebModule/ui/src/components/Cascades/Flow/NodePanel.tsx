import React, { useCallback, useState, useEffect, useMemo } from 'react';
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
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { NodeType, TrainingProject } from '../../../store/trainingProjectSlice';
import { Url } from '../../../constant';
import { getModelId } from '../utils';
import { trainingProjectPartsSelectorFactory } from '../../../store/partSlice';

interface Props {
  selectedNode: Node;
  setSelectedNode: React.Dispatch<any>;
  model: TrainingProject | null;
  setElements: React.Dispatch<React.SetStateAction<(Node<any> | Edge<any>)[]>>;
  matchTargetLabels: string[];
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
  if (isNil(name) || isEmpty(name)) return false;

  return true;
};

const getModelTags = (project: TrainingProject) => {
  if (!project) return [];

  return project.outputs
    .filter((output) => output.metadata.labels)
    .map((output) => output.metadata.labels.map((label) => label))[0];
};

const NodePanel = (props: Props) => {
  const { selectedNode, setSelectedNode, model, setElements, matchTargetLabels } = props;

  const partSelector = useMemo(() => trainingProjectPartsSelectorFactory(model?.id), [model]);
  const parts = useSelector(partSelector);

  const [exportName, setExportName] = useState<string>(null);
  const [threshold, setThreshold] = useState(null);
  const [type, setType] = useState('crop');
  const [tagId, setTagId] = useState(-1);

  const history = useHistory();

  useEffect(() => {
    setExportName(selectedNode?.data.name);

    if ((selectedNode?.type as NodeType) === 'openvino_library') {
      setThreshold(+selectedNode?.data.params.confidence_threshold * 100);
      setTagId(+selectedNode?.data.params.filter_label_id);
    }
  }, [selectedNode]);

  const tagsOptions: IDropdownOption[] = matchTargetLabels.map((label, id) => ({ key: id, text: label }));

  const typeOptions: IDropdownOption[] = [{ key: 'crop', text: 'Crop' }];

  const onNameChange = useCallback((value: string) => {
    setExportName(value);
  }, []);

  const onSaveTransformNode = useCallback(() => {
    setElements((prev) => {
      const node = prev.find((element) => element.id === selectedNode.id);
      const newNode = {
        ...node,
        data: {
          ...node.data,
          params: { ...node.data.params, confidence_threshold: threshold / 100, filter_label_id: tagId },
        },
      };
      const newElements = prev.filter((element) => element.id !== selectedNode.id);

      return [...newElements, newNode];
    });

    setSelectedNode(null);
  }, [setElements, selectedNode, setSelectedNode, threshold, tagId]);

  const onSaveExportNode = useCallback(() => {
    setElements((prev) => {
      const node = prev.find((element) => element.id === selectedNode.id);
      const newNode = { ...node, data: { ...node.data, name: exportName } };
      const newElements = prev.filter((element) => element.id !== selectedNode.id);

      return [...newElements, newNode];
    });

    setSelectedNode(null);
  }, [exportName, setElements, selectedNode, setSelectedNode]);

  const onDirectModel = useCallback(() => {
    history.push(`${Url.MODELS}?modelId=${getModelId(selectedNode.id)}`);
  }, [history, selectedNode]);

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
            {(selectedNode.type as NodeType) === 'customvision_model' && (
              <PrimaryButton text="Go to Models" onClick={onDirectModel} />
            )}
            {(selectedNode.type as NodeType) === 'openvino_model' && (
              <PrimaryButton text="Go to Models" onClick={onDirectModel} />
            )}
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
        {['openvino_model', 'customvision_model'].includes(selectedNode.type as NodeType) && (
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
              <Text>
                {(selectedNode.type as NodeType) === 'customvision_model'
                  ? 'By Microsoft Custom Vision'
                  : 'Intel'}
              </Text>
            </Stack>
            <Stack>
              <Label>Objects / Tags</Label>
              <Stack horizontal tokens={{ childrenGap: 6 }}>
                {model.category === 'customvision' &&
                  parts.map((part, i) => (
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
                      {part.name}
                    </Stack>
                  ))}
                {model.category === 'openvino' &&
                  getModelTags(model).map((part, i) => (
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
                      {part}
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
              selectedKey={tagId}
              onChange={(_, options) => setTagId(options.key as number)}
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
          </Stack>
        )}
      </Panel>
    </>
  );
};

export default NodePanel;

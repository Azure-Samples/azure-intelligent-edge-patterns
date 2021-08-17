import React, { useState, useCallback, useEffect } from 'react';
import {
  Stack,
  ICommandBarItemProps,
  Label,
  CommandBar,
  IBreadcrumbItem,
  Breadcrumb,
  mergeStyleSets,
  Modal,
  TextField,
  PrimaryButton,
  DefaultButton,
  IconButton,
} from '@fluentui/react';
import { Route, Switch, useHistory, useRouteMatch, match } from 'react-router-dom';
import { Node, Edge, isNode, isEdge } from 'react-flow-renderer';
import { useSelector, useDispatch } from 'react-redux';

import { State as RootState } from 'RootStateType';
import { Url } from '../../enums';
import {
  trainingProjectIsSourceNodeFactory,
  trainingProjectIsCascadesFactory,
  NodeType,
  TrainingProject,
} from '../../store/trainingProjectSlice';
import { CreateCascadePayload, createCascade, selectAllCascades } from '../../store/cascadeSlice';

import Cascades from './Cascades';
import CascadeCreate from './Create/Create';
import CascadeDetail from './CascadeDetail';
import { getModel } from './utils';

const getSourceElements = (modelId: number) => [
  {
    id: `0_${modelId}`,
    type: 'source' as NodeType,
    data: { id: modelId },
    position: { x: 350, y: 50 },
  },
];

const getClasses = () =>
  mergeStyleSets({
    breadcrumb: {
      paddingLeft: '16px',
      '& div, button': {
        fontSize: '14px',
        lineHeight: '20px',
        color: '#0078D4',
      },
    },
    model: {
      padding: '10px',
    },
  });

const getConvertNode = (node: Node, modelList: TrainingProject[]) => {
  const matchModel = getModel(node.id, modelList);

  console.log('node', node);
  console.log('matchModel', matchModel);
  console.log({
    node_id: node.id,
    name: matchModel.name,
    type: node.type,
    inputs: matchModel.inputs,
    outputs: matchModel.outputs,
  });

  return {
    node_id: node.id,
    name: matchModel.name,
    type: node.type,
    inputs: matchModel.inputs,
    outputs: matchModel.outputs,
    openvino_model_name: matchModel.openvino_model_name,
    openvino_library_name: matchModel.openvino_library_name,
    demultiply_count: matchModel.demultiply_count,
    params: matchModel.params,
    combined: matchModel.combined,
  };
};

const getConvertEdge = (edge: Edge, modelList: TrainingProject[]) => {
  const sourceModel = getModel(edge.source, modelList);
  const targetModel = getModel(edge.target, modelList);

  return {
    source: {
      node_id: edge.source,
      output_name: sourceModel.outputs[parseInt(edge.sourceHandle, 10)].name,
    },
    target: {
      node_id: edge.target,
      input_name: targetModel.inputs[parseInt(edge.targetHandle, 10)].name,
    },
  };
};

const getCreateCascadePayload = (
  elements: (Node | Edge)[],
  name: string,
  modelList: TrainingProject[],
): CreateCascadePayload => {
  const payload = {
    flow: JSON.stringify({
      name,
      nodes: elements.filter((ele) => isNode(ele)).map((node: Node) => getConvertNode(node, modelList)),
      edges: elements.filter((ele) => isEdge(ele)).map((edge: Edge) => getConvertEdge(edge, modelList)),
    }),
    raw_data: JSON.stringify(elements),
    name,
  };

  return payload;
};

const getSaveText = (isMatchEditRoute: match<{}>, isMatchCreationRoute: match<{}>) => {
  if (isMatchCreationRoute?.isExact) return 'Add';
  if (isMatchEditRoute?.isExact) return 'Save';
  return 'Create Cascade';
};

const CascadesContainer = () => {
  const history = useHistory();
  const dispatch = useDispatch();

  const sourceNode = useSelector(trainingProjectIsSourceNodeFactory());
  const modelList = useSelector(trainingProjectIsCascadesFactory());
  const cascadeList = useSelector((state: RootState) => selectAllCascades(state));

  const [elements, setElements] = useState<(Node | Edge)[]>([]);
  const [defaultName, setDefaultName] = useState('Default Cascade');
  const [isPopup, setIsPopup] = useState(false);

  const isMatchCreationRoute = useRouteMatch(Url.CASCADES_CREATE);
  const isMatchEditRoute = useRouteMatch(Url.CASCADES_DETAIL);
  const isMatchCascadeRoute = useRouteMatch(Url.CASCADES);
  const classes = getClasses();

  console.log('isMatchCreationRoute', isMatchCreationRoute);
  console.log('isMatchEditRoute', isMatchEditRoute);
  console.log('isMatchCascadeRoute', isMatchCascadeRoute);

  useEffect(() => {
    setElements(getSourceElements(sourceNode.id));
  }, [sourceNode]);

  const onCreateCascades = useCallback(() => {
    setElements(getSourceElements(sourceNode.id));
    setDefaultName('Default Cascade');

    history.push(Url.CASCADES_CREATE);
  }, [history, sourceNode]);

  const onSaveCascades = useCallback(async () => {
    await dispatch(createCascade(getCreateCascadePayload(elements, defaultName, modelList)));

    history.push(Url.CASCADES);
  }, [dispatch, elements, defaultName, history, modelList]);

  const onEditCascade = useCallback((id: number) => {
    console.log('onEditCascade', id);
  }, []);

  const breadCrumbItems: IBreadcrumbItem[] = [
    { text: 'Home', key: 'home', onClick: () => history.push(Url.HOME) },
    { text: 'Cascades', key: 'Cascades', onClick: () => history.push(Url.CASCADES) },
    { text: '', key: 'new' },
  ];

  const onSaveClick = useCallback(() => {
    if (isMatchCreationRoute?.isExact) {
      onSaveCascades();
      return;
    }

    if (isMatchEditRoute?.isExact) {
      onEditCascade(1);
      return;
    }

    if (isMatchCascadeRoute?.isExact) {
      onCreateCascades();
      return;
    }
  }, [
    isMatchCreationRoute,
    isMatchEditRoute,
    isMatchCascadeRoute,
    onSaveCascades,
    onEditCascade,
    onCreateCascades,
  ]);

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'addBtn',
      text: getSaveText(isMatchEditRoute, isMatchCreationRoute),
      iconProps: {
        iconName: 'Add',
      },
      onClick: onSaveClick,
    },
    {
      key: 'refresh',
      text: 'Refresh',
      iconProps: {
        iconName: 'Refresh',
      },
      onClick: () => history.go(0),
    },
    {
      key: 'undo',
      text: 'Undo',
      iconProps: {
        iconName: 'Undo',
      },
    },
    {
      key: 'feedback',
      text: 'Feedback',
      iconProps: {
        iconName: 'Emoji2',
      },
      buttonStyles: {
        root: { borderLeft: '1px solid #C8C6C4' },
      },
      onClick: () => {},
    },
    {
      key: 'learnMore',
      text: 'Learn more',
      iconProps: {
        iconName: 'NavigateExternalInline',
      },
      onClick: () => {
        const win = window.open(
          'https://github.com/Azure-Samples/azure-intelligent-edge-patterns/tree/master/factory-ai-vision',
          '_blank',
        );
        win.focus();
      },
    },
    {
      key: 'help',
      text: 'Troubleshooting',
      iconProps: {
        iconName: 'Help',
      },
      onClick: () => {
        const win = window.open(
          'https://github.com/Azure-Samples/azure-intelligent-edge-patterns/issues',
          '_blank',
        );
        win.focus();
      },
    },
  ];

  return (
    <>
      <Stack
        styles={{
          root: {
            height: '100%',
            overflowY: 'auto',
            padding: isMatchCreationRoute ? '0 0' : '32px 0',
          },
        }}
      >
        {isMatchCreationRoute && <Breadcrumb items={breadCrumbItems} styles={{ root: classes.breadcrumb }} />}
        {isMatchCreationRoute || isMatchEditRoute ? (
          <Label
            styles={{ root: { fontSize: '18px', lineHeight: '24px', paddingLeft: '24px' } }}
            onClick={() => setIsPopup(true)}
          >
            {defaultName}
          </Label>
        ) : (
          <Label styles={{ root: { fontSize: '18px', lineHeight: '24px', paddingLeft: '24px' } }}>
            Cascade
          </Label>
        )}
        <CommandBar styles={{ root: { marginTop: '24px' } }} items={commandBarItems} />
        <Switch>
          <Route
            exact
            path={Url.CASCADES_CREATE}
            render={() => (
              <CascadeCreate elements={elements} setElements={setElements} modelList={modelList} />
            )}
          />
          <Route
            exact
            path={Url.CASCADES_DETAIL}
            render={() => (
              <CascadeDetail elements={elements} setElements={setElements} modelList={modelList} />
            )}
          />
          <Route
            exact
            path={Url.CASCADES}
            render={() => <Cascades onCreateCascades={onCreateCascades} cascadeList={cascadeList} />}
          />
        </Switch>
      </Stack>
      {isPopup && (
        <Modal isOpen={true} onDismiss={() => setIsPopup(false)} styles={{ main: classes.model }}>
          <Stack horizontalAlign="end">
            <IconButton iconProps={{ iconName: 'Cancel' }} onClick={() => setIsPopup(false)} />
          </Stack>
          <Stack tokens={{ childrenGap: 15 }}>
            <TextField
              label="Input Cascade Name"
              value={defaultName}
              onChange={(_, value: string) => setDefaultName(value)}
            />
            <Stack horizontal horizontalAlign="space-around">
              <PrimaryButton onClick={() => setIsPopup(false)}>Save</PrimaryButton>
              <DefaultButton onClick={() => setIsPopup(false)}>Cancel</DefaultButton>
            </Stack>
          </Stack>
        </Modal>
      )}
    </>
  );
};

export default CascadesContainer;

import React, { useState, useCallback } from 'react';
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
import { Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import { Node, Edge } from 'react-flow-renderer';

import { Url } from '../../enums';

import Cascades from './Cascades';
import CascadeCreate from './Create/Create';

const initialElements = [
  {
    id: '0',
    type: 'initial',
    data: {},
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

const CascadesContainer = () => {
  const history = useHistory();

  const [elements, setElements] = useState<(Node | Edge)[]>(initialElements);
  const [defaultName, setDefaultName] = useState('Default Cascade');
  const [isPopup, setIsPopup] = useState(false);

  const isMatchCreationRoute = useRouteMatch(Url.CASCADES_CREATE);
  const classes = getClasses();

  console.log('isMatchCreationRoute', isMatchCreationRoute);

  const onCreateCascades = useCallback(() => {
    history.push(Url.CASCADES_CREATE);
  }, [history]);

  const onSaveCascades = useCallback(() => {
    console.log('onSaveCascades', elements);
  }, []);

  const onSaveCascadeName = useCallback(() => {
    setIsPopup(false)
  }, [])

  const breadCrumbItems: IBreadcrumbItem[] = [
    { text: 'Home', key: 'home', onClick: () => history.push(Url.HOME) },
    { text: 'Cascades', key: 'Cascades', onClick: () => history.push(Url.CASCADES) },
    { text: '', key: 'new' },
  ];

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'addBtn',
      text: isMatchCreationRoute ? 'Add' : 'Create Cascade',
      iconProps: {
        iconName: 'Add',
      },
      onClick: () => (isMatchCreationRoute ? onSaveCascades() : onCreateCascades()),
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
        {isMatchCreationRoute ? (
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
            render={() => <CascadeCreate elements={elements} setElements={setElements} />}
          />
          <Route exact path={Url.CASCADES} render={() => <Cascades onCreateCascades={onCreateCascades} />} />
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
            <Stack horizontal>
              <PrimaryButton onClick={onSaveCascadeName} >Save</PrimaryButton>
              <DefaultButton>Cancel</DefaultButton>
            </Stack>
          </Stack>
        </Modal>
      )}
    </>
  );
};

export default CascadesContainer;

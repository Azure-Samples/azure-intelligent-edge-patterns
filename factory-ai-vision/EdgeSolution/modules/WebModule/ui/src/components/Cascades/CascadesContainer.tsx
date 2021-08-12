import React, { useState, useCallback } from 'react';
import {
  Stack,
  ActionButton,
  Icon,
  Link,
  ICommandBarItemProps,
  Label,
  CommandBar,
  PrimaryButton,
  Text,
  IBreadcrumbItem,
  Breadcrumb,
  mergeStyleSets,
} from '@fluentui/react';
import { Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';

import { Url } from '../../enums';

import Cascades from './Cascades';
import CascadeCreate from './Create/Create';

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
  });

const CascadesContainer = () => {
  const history = useHistory();

  const isMatchCreationRoute = useRouteMatch(Url.CASCADES_CREATE);
  const classes = getClasses();

  console.log('isMatchCreationRoute', isMatchCreationRoute);

  const onCreateCascades = useCallback(() => {
    history.push(Url.CASCADES_CREATE);
  }, [history]);

  const breadCrumbItems: IBreadcrumbItem[] = [
    { text: 'Home', key: 'home', onClick: () => history.push(Url.HOME) },
    { text: 'Cascades', key: 'Cascades', onClick: () => history.push(Url.CASCADES) },
    { text: '', key: 'new' },
  ];

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'addBtn',
      text: 'Create Cascade',
      iconProps: {
        iconName: 'Add',
      },
      onClick: () => onCreateCascades(),
    },
    // {
    //   key: 'saveBtn',
    //   text: 'Save',
    //   iconProps: {
    //     iconName: 'Save',
    //   },
    // },
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
      <Label styles={{ root: { fontSize: '18px', lineHeight: '24px', paddingLeft: '24px' } }}>Cascade</Label>
      <CommandBar styles={{ root: { marginTop: '24px' } }} items={commandBarItems} />
      <Switch>
        <Route exact path={Url.CASCADES_CREATE} render={() => <CascadeCreate />} />
        <Route exact path={Url.CASCADES} render={() => <Cascades onCreateCascades={onCreateCascades} />} />
      </Switch>
    </Stack>
  );
};

export default CascadesContainer;

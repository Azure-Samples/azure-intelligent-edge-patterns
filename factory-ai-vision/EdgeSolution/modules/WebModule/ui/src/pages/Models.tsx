import React, { useMemo, useState, useEffect } from 'react';
import {
  CommandBar,
  ICommandBarItemProps,
  getTheme,
  Stack,
  Breadcrumb,
  ProgressIndicator,
  Label,
} from '@fluentui/react';
import { useBoolean } from '@uifabric/react-hooks';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

// import ModelComponent from '../components/Models/Model';
// import AddModelPanel, { PanelMode } from '../components/Models/AddModelPanel';
import AddPanel from '../components/Models/Panel/AddPanel';
import ModelDashboard from '../components/Models/Dashboard';
import { getParts } from '../store/partSlice';

const theme = getTheme();

type ModelType = 'custom' | 'own' | 'ovms';

export const Models = () => {
  const [isPanelOpen, { setTrue: handlePanelOpen, setFalse: handlePanelDissmiss }] = useBoolean(false);
  const [isOpen, setIsOpen] = useState(false);
  const [modelType, setModelType] = useState<ModelType>('custom');

  const history = useHistory();

  // const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getParts());
  }, [dispatch]);

  // const commandBarItems: ICommandBarItemProps[] = useMemo(
  //   () => [
  //     {
  //       key: 'addBtn',
  //       text: 'Add',
  //       iconProps: {
  //         iconName: 'Add',
  //       },
  //       onClick: handlePanelOpen,
  //     },
  //     {
  //       key: 'addBtn',
  //       text: 'Add',
  //       iconProps: {
  //         iconName: 'Add',
  //       },
  //       onClick: () => setIsOpen(true),
  //     },
  //   ],
  //   [],
  // );

  const newCommandBarItems: ICommandBarItemProps[] = [
    {
      key: 'addBtn',
      text: 'Create custom',
      iconProps: {
        iconName: 'Add',
      },
      onClick: () => {
        setModelType('custom');
        setIsOpen(true);
      },
    },
    {
      key: 'browse',
      text: 'Browse',
      iconProps: {
        iconName: 'OfficeStoreLogo',
      },
      onClick: () => {
        setModelType('ovms');
        setIsOpen(true);
      },
    },
    {
      key: 'upload',
      text: 'Upload',
      iconProps: {
        iconName: 'Upload',
      },
      onClick: () => {
        setModelType('own');
        setIsOpen(true);
      },
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
      key: 'filter',
      text: 'Filter',
      iconProps: {
        iconName: 'Filter',
      },
      onClick: () => {},
    },
    {
      key: 'feedback',
      text: 'Feedback',
      buttonStyles: {
        root: { borderLeft: '1px solid #C8C6C4' },
      },
      iconProps: {
        iconName: 'Emoji2',
      },
      onClick: () => {},
    },
    {
      key: 'learnMore',
      text: 'Learn more',
      iconProps: {
        iconName: 'NavigateExternalInline',
      },
      onClick: () => {},
    },
    {
      key: 'help',
      text: 'Troubleshooting',
      iconProps: {
        iconName: 'Help',
      },
      onClick: () => {},
    },
  ];

  return (
    <>
      {/* <Stack styles={{ root: { height: '100%' } }}>
        <CommandBar
          items={commandBarItems}
          styles={{ root: { borderBottom: `solid 1px ${theme.palette.neutralLight}` } }}
        />
        <Stack styles={{ root: { padding: '15px' } }} grow>
          <Breadcrumb items={[{ key: 'models', text: 'Models' }]} />
          <ModelComponent onAddModelClick={handlePanelOpen} />
        </Stack>
      </Stack> */}
      <Stack styles={{ root: { height: '100%', padding: '32px 16px' } }}>
        <Label styles={{ root: { fontSize: '18px', lineHeight: '24px' } }}>Models</Label>
        <Stack tokens={{ childrenGap: '65px' }}>
          <CommandBar styles={{ root: { marginTop: '24px' } }} items={newCommandBarItems} />
          <ModelDashboard onOpen={() => setIsOpen(true)} onPanelTypeChange={setModelType} />
        </Stack>
      </Stack>
      {/* <AddModelPanel isOpen={isPanelOpen} onDissmiss={handlePanelDissmiss} mode={PanelMode.Create} /> */}
      <AddPanel isOpen={isOpen} modelType={modelType} onDissmiss={() => setIsOpen(false)} />
    </>
  );
};

import React, { useState, useEffect } from 'react';
import { CommandBar, ICommandBarItemProps, getTheme, Stack, Label } from '@fluentui/react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import AddPanel from '../components/Models/Panel/AddPanel';
import ModelDashboard from '../components/Models/Dashboard';
import { getParts } from '../store/partSlice';

type ModelType = 'custom' | 'own' | 'ovms';

export const Models = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modelType, setModelType] = useState<ModelType>('custom');

  const history = useHistory();

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getParts());
  }, [dispatch]);

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
    // {
    //   key: 'upload',
    //   text: 'Upload',
    //   iconProps: {
    //     iconName: 'Upload',
    //   },
    //   onClick: () => {
    //     setModelType('own');
    //     setIsOpen(true);
    //   },

    // },
    {
      key: 'refresh',
      text: 'Refresh',
      iconProps: {
        iconName: 'Refresh',
      },
      buttonStyles: {
        root: { borderLeft: '1px solid #C8C6C4' },
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
      <Stack styles={{ root: { height: '100%', padding: '32px 16px' } }}>
        <Label styles={{ root: { fontSize: '18px', lineHeight: '24px' } }}>Models</Label>
        <Stack tokens={{ childrenGap: '65px' }}>
          <CommandBar styles={{ root: { marginTop: '24px' } }} items={newCommandBarItems} />
          <ModelDashboard onOpen={() => setIsOpen(true)} onPanelTypeChange={setModelType} />
        </Stack>
      </Stack>
      <AddPanel isOpen={isOpen} modelType={modelType} onDissmiss={() => setIsOpen(false)} />
    </>
  );
};

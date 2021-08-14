import React, { useState, useEffect } from 'react';
import {
  CommandBar,
  ICommandBarItemProps,
  getTheme,
  Stack,
  Label,
  IBreadcrumbItem,
  Breadcrumb,
  mergeStyleSets,
} from '@fluentui/react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

// import AddPanel from '../components/Models/Panel/AddPanel';
import Model from './Model';
import { getParts } from '../../store/partSlice';
import { getIntelOvmsProjectList } from '../../store/IntelOvmsProjectSlice';
import AddCustomVision from './Panel/AddCustomVision';
import IntelOvmsDashboard from './IntelOvmsDashboard';

const getClasses = () =>
  mergeStyleSets({
    breadcrumb: {
      '& div, button': {
        fontSize: '14px',
        lineHeight: '20px',
        color: '#0078D4',
      },
    },
  });

const ModelContainer = () => {
  // const [isOpen, setIsOpen] = useState(false);
  const [isAddCustomVision, setIsAddCustomVision] = useState(false);
  const [isAddIntelOvms, setIsAddIntelOvms] = useState(false);
  const [isAddUpload, setIsAddUpload] = useState(false);

  const history = useHistory();
  const dispatch = useDispatch();
  const classes = getClasses();

  useEffect(() => {
    dispatch(getParts());
    dispatch(getIntelOvmsProjectList());
  }, [dispatch]);

  const newCommandBarItems: ICommandBarItemProps[] = [
    {
      key: 'addBtn',
      text: 'Create custom',
      iconProps: {
        iconName: 'Add',
      },
      onClick: () => {
        setIsAddIntelOvms(false);
        setIsAddCustomVision(true);
      },
    },
    {
      key: 'browse',
      text: 'Browse',
      iconProps: {
        iconName: 'OfficeStoreLogo',
      },
      onClick: () => {
        setIsAddIntelOvms((prev) => !prev);
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

  const items: IBreadcrumbItem[] = [
    { text: 'Models', key: 'models', onClick: () => setIsAddIntelOvms(false) },
    { text: 'Browse', key: 'browse' },
  ];

  return (
    <>
      <Stack
        styles={{
          root: { height: '100%', padding: isAddIntelOvms ? '0 16px 32px' : '32px 16px', overflowY: 'auto' },
        }}
      >
        {isAddIntelOvms && (
          <Breadcrumb
            styles={{
              root: classes.breadcrumb,
            }}
            // className={classes.breadcrumb}
            items={items}
            // ariaLabel="Breadcrumb with items rendered as buttons"
            // overflowAriaLabel="More links"
          />
        )}
        <Label styles={{ root: { fontSize: '18px', lineHeight: '24px' } }}>
          {isAddIntelOvms ? 'Model Zoo ' : 'Models'}
        </Label>
        <Stack tokens={{ childrenGap: '65px' }}>
          <CommandBar styles={{ root: { marginTop: '24px' } }} items={newCommandBarItems} />
          {isAddIntelOvms ? (
            <IntelOvmsDashboard />
          ) : (
            <Model
              onOpenCustomVision={() => setIsAddCustomVision(true)}
              onOpenIntelOvms={() => setIsAddIntelOvms(true)}
              onOpenOwnUpload={() => setIsAddUpload(true)}
            />
          )}
        </Stack>
      </Stack>
      <AddCustomVision isOpen={isAddCustomVision} onDissmiss={() => setIsAddCustomVision(false)} />
      {/* <AddPanel isOpen={isOpen} modelType={modelType} onDissmiss={() => setIsOpen(false)} /> */}
    </>
  );
};

export default ModelContainer;

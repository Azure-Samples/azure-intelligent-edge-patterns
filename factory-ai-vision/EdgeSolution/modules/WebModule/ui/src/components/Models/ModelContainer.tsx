import React, { useState } from 'react';
import {
  CommandBar,
  ICommandBarItemProps,
  Stack,
  Label,
  IBreadcrumbItem,
  Breadcrumb,
  mergeStyleSets,
} from '@fluentui/react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { trainingProjectModelFactory } from '../../store/trainingProjectSlice';
import { State as RootState } from 'RootStateType';
import { selectAllIntelProject } from '../../store/IntelProjectSlice';

import Model from './Model';
import AddCustomVisionContainer from './Panel/AddCustomVisionContainer';
import OpenVinoDashboard from './OpenVinoDashboard';

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
  const [isAddCustomVision, setIsAddCustomVision] = useState(false);
  const [isAddIntelOvms, setIsAddIntelOvms] = useState(false);
  const [isAddUpload, setIsAddUpload] = useState(false);

  const trainingProjectList = useSelector(trainingProjectModelFactory());
  const intelProjectList = useSelector((state: RootState) => selectAllIntelProject(state));

  const history = useHistory();
  const classes = getClasses();

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
      text: 'Browse Zoo',
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
      key: 'feedback',
      text: 'Feedback',
      iconProps: {
        iconName: 'Emoji2',
      },
      onClick: () => {
        const win = window.open('https://go.microsoft.com/fwlink/?linkid=2173530', '_blank');
        win.focus();
      },
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
            items={items}
          />
        )}
        <Label styles={{ root: { fontSize: '18px', lineHeight: '24px' } }}>
          {isAddIntelOvms ? 'Model Zoo ' : 'Models'}
        </Label>
        <Stack tokens={{ childrenGap: '65px' }}>
          <CommandBar styles={{ root: { marginTop: '24px' } }} items={newCommandBarItems} />
          {isAddIntelOvms ? (
            <OpenVinoDashboard
              intelProjectList={intelProjectList}
              openVinoProjectList={trainingProjectList.filter((project) => project.category === 'openvino')}
              onCloseIntel={() => setIsAddIntelOvms(false)}
            />
          ) : (
            <Model
              trainingProjectList={trainingProjectList}
              onOpenCustomVision={() => setIsAddCustomVision(true)}
              onOpenIntelOvms={() => setIsAddIntelOvms(true)}
              onOpenOwnUpload={() => setIsAddUpload(true)}
            />
          )}
        </Stack>
      </Stack>
      <AddCustomVisionContainer isOpen={isAddCustomVision} onDismiss={() => setIsAddCustomVision(false)} />
    </>
  );
};

export default ModelContainer;

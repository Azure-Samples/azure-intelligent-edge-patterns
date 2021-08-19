import React, { useState, useCallback } from 'react';
import {
  Stack,
  ICommandBarItemProps,
  Label,
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
import { useSelector } from 'react-redux';

import { State as RootState } from 'RootStateType';
import { Url } from '../../enums';
import { trainingProjectIsCascadesFactory } from '../../store/trainingProjectSlice';
import { selectAllCascades } from '../../store/cascadeSlice';

import Cascades from './Cascades';
import CascadeCreate from './CascadeCreate';
import CascadeDetail from './CascadeDetail';
import NameModal from './NameModal';

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

  const modelList = useSelector(trainingProjectIsCascadesFactory());
  const cascadeList = useSelector((state: RootState) => selectAllCascades(state));

  const [cascadeName, setCascadeName] = useState('Default Cascade');
  const [isPopup, setIsPopup] = useState(false);

  const isMatchCreationRoute = useRouteMatch(Url.CASCADES_CREATE);
  const isMatchEditRoute = useRouteMatch(Url.CASCADES_DETAIL);
  const classes = getClasses();

  const onCreateCascades = useCallback(() => {
    setCascadeName('Default Cascade');
    history.push(Url.CASCADES_CREATE);
  }, [history]);

  const breadCrumbItems: IBreadcrumbItem[] = [
    { text: 'Home', key: 'home', onClick: () => history.push(Url.HOME) },
    { text: 'Cascades', key: 'Cascades', onClick: () => history.push(Url.CASCADES) },
    { text: '', key: 'new' },
  ];

  const defaultCommandBarItems: ICommandBarItemProps[] = [
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
            padding: isMatchCreationRoute || isMatchEditRoute ? '0 0' : '32px 0',
          },
        }}
      >
        {(isMatchCreationRoute || isMatchEditRoute) && (
          <Breadcrumb items={breadCrumbItems} styles={{ root: classes.breadcrumb }} />
        )}
        {isMatchCreationRoute || isMatchEditRoute ? (
          <Label
            styles={{ root: { fontSize: '18px', lineHeight: '24px', paddingLeft: '24px' } }}
            onClick={() => setIsPopup(true)}
          >
            {cascadeName}
          </Label>
        ) : (
          <Label styles={{ root: { fontSize: '18px', lineHeight: '24px', paddingLeft: '24px' } }}>
            Cascade
          </Label>
        )}
        <Switch>
          <Route
            exact
            path={Url.CASCADES_CREATE}
            render={() => (
              <CascadeCreate
                modelList={modelList}
                cascadeName={cascadeName}
                defaultCommandBarItems={defaultCommandBarItems}
              />
            )}
          />
          <Route
            exact
            path={Url.CASCADES_DETAIL}
            render={() => (
              <CascadeDetail
                modelList={modelList}
                cascadeList={cascadeList}
                cascadeName={cascadeName}
                defaultCommandBarItems={defaultCommandBarItems}
                setCascadeName={setCascadeName}
              />
            )}
          />
          <Route
            exact
            path={Url.CASCADES}
            render={() => (
              <Cascades
                onCreateCascades={onCreateCascades}
                cascadeList={cascadeList}
                defaultCommandBarItems={defaultCommandBarItems}
              />
            )}
          />
        </Switch>
      </Stack>
      {isPopup && (
        <NameModal
          onClose={() => setIsPopup(false)}
          onSave={() => setIsPopup(false)}
          cascadeName={cascadeName}
          setCascadeName={setCascadeName}
        />
      )}
    </>
  );
};

export default CascadesContainer;

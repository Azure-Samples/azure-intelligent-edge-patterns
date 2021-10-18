import React, { useCallback } from 'react';
import { Stack, ICommandBarItemProps, IBreadcrumbItem, Breadcrumb, mergeStyleSets } from '@fluentui/react';
import { Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { State as RootState } from 'RootStateType';
import { Url } from '../../constant';
import { trainingProjectIsCascadesFactory } from '../../store/trainingProjectSlice';
import { selectAllCascades } from '../../store/cascadeSlice';

import Cascades from './Cascades';
import CascadeCreate from './CascadeCreate';
import CascadeDetail from './CascadeDetail';

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

  const isMatchCreationRoute = useRouteMatch(Url.CASCADES_CREATE);
  const isMatchEditRoute = useRouteMatch(Url.CASCADES_DETAIL);
  const classes = getClasses();

  const onCreateCascades = useCallback(() => {
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
      key: 'feedback',
      text: 'Feedback',
      iconProps: {
        iconName: 'Emoji2',
      },
      buttonStyles: {
        root: { borderLeft: '1px solid #C8C6C4' },
      },
      onClick: () => {
        const win = window.open('https://go.microsoft.com/fwlink/?linkid=2173531', '_blank');
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
        {/* {isMatchCreationRoute || isMatchEditRoute ? (
          <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 8 }}>
            <Label styles={{ root: { fontSize: '18px', lineHeight: '24px', paddingLeft: '24px' } }}>
              {cascadeName}
            </Label>
            <IconButton
              iconProps={{ iconName: 'Edit' }}
              onClick={() => setIsPopup(true)}
              styles={{ icon: { fontSize: '12px', color: '#323130' } }}
            />
          </Stack>
        ) : (
          <Label styles={{ root: { fontSize: '18px', lineHeight: '24px', paddingLeft: '24px' } }}>
            Cascade
          </Label>
        )} */}
        <Switch>
          <Route
            exact
            path={Url.CASCADES_CREATE}
            render={() => (
              <CascadeCreate
                modelList={modelList}
                defaultCommandBarItems={defaultCommandBarItems}
                existingCascadeNameList={cascadeList.map((cascade) => cascade.name)}
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
                defaultCommandBarItems={defaultCommandBarItems}
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
    </>
  );
};

export default CascadesContainer;

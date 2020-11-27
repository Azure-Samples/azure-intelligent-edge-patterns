/* eslint react/display-name: "off" */

import React from 'react';
import { useHistory } from 'react-router-dom';
import {
  Breadcrumb,
  Stack,
  CommandBar,
  ICommandBarItemProps,
  getTheme,
  IBreadcrumbItem,
  Text,
  IStackTokens,
  ITextStyles,
} from '@fluentui/react';
import { useSelector, useDispatch } from 'react-redux';
import { useBoolean } from '@uifabric/react-hooks';
import * as R from 'ramda';

import { State } from 'RootStateType';

import {
  selectTrainingProjectById,
  TrainingProject as TrainingProjectType,
  deleteCustomProject,
} from '../store/trainingProjectSlice';

import { useQuery } from '../hooks/useQuery';

import AddCameraPanel, { PanelMode } from '../components/Models/AddModelPanel';

type PassingProps = {};

type ModelDetailProps = {
  handlePanelOpen: () => void;
  project: TrainingProjectType;
};

const theme = getTheme();
const titleStyles: ITextStyles = { root: { fontWeight: 600, fontSize: '16px' } };
const infoBlockTokens: IStackTokens = { childrenGap: 10 };

const BaseModelDetail: React.FC<ModelDetailProps> = ({ handlePanelOpen, project }) => {
  const dispatch = useDispatch();
  const history = useHistory();

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'edit',
      text: 'Edit',
      iconProps: {
        iconName: 'Edit',
      },
      onClick: handlePanelOpen,
    },
    {
      key: 'delete',
      text: 'Delete',
      iconProps: {
        iconName: 'Delete',
      },
      onClick: () => {
        // Because onClick cannot accept the return type Promise<void>, use the IIFE to workaround
        (async () => {
          // eslint-disable-next-line no-restricted-globals
          if (!confirm('Sure you want to delete?')) return;

          await dispatch(
            deleteCustomProject({
              id: project.id,
              resolve: () => {
                history.push('/models');
              },
            }),
          );
        })();
      },
    },
  ];

  const breadCrumbItems: IBreadcrumbItem[] = [
    {
      key: 'models',
      text: 'Models',
      href: '/models',
      onClick: (ev, item) => {
        ev.preventDefault();
        history.push(item.href);
      },
    },
    { key: project.name, text: project.name },
  ];

  return (
    <Stack styles={{ root: { height: '100%' } }}>
      <CommandBar
        items={commandBarItems}
        styles={{ root: { borderBottom: `solid 1px ${theme.palette.neutralLight}` } }}
      />
      <Stack tokens={{ childrenGap: 30 }} styles={{ root: { padding: '15px' } }} grow>
        <Breadcrumb items={breadCrumbItems} />
        <Stack tokens={{ childrenGap: 30 }} styles={{ root: { width: '20%', marginLeft: '0.8em' } }}>
          <Stack tokens={infoBlockTokens}>
            <Text styles={titleStyles}>Model URI</Text>
            <Text block nowrap>
              {project.predictionUri}
            </Text>
          </Stack>
          <Stack tokens={infoBlockTokens}>
            <Text styles={titleStyles}>Model Header</Text>
            <Text>{project.predictionHeader}</Text>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};

export const ModelDetail = R.compose(
  (BaseComponent: React.ComponentType<ModelDetailProps>): React.FC => () => {
    const [isPanelOpen, { setTrue: handlePanelOpen, setFalse: handlePanelDissmiss }] = useBoolean(false);

    const modelId = parseInt(useQuery().get('modelId'), 10);
    const trainingProject = useSelector((state: State) => selectTrainingProjectById(state, modelId));

    console.log('TrainingProject', trainingProject);

    return (
      <>
        <BaseComponent handlePanelOpen={handlePanelOpen} project={trainingProject} />
        <AddCameraPanel
          initialValue={{
            name: trainingProject.name,
            endPoint: trainingProject.predictionUri,
            header: trainingProject.predictionHeader,
            labels: '',
            setting: false,
            id: trainingProject.id,
          }}
          isOpen={isPanelOpen}
          onDissmiss={handlePanelDissmiss}
          mode={PanelMode.Update}
        />
      </>
    );
  },
)(BaseModelDetail);

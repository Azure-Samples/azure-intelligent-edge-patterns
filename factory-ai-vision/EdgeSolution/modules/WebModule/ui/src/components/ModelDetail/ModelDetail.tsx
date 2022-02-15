import React, { useState } from 'react';
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
import { useDispatch } from 'react-redux';

import {
  TrainingProject as TrainingProjectType,
  deleteCustomProject,
} from '../../store/trainingProjectSlice';

import { Url } from '../../constant';

import AddModelPanel, { PanelMode } from '../../components/Models/AddModelPanel';
import ModelParts from '../ModelParts/Parts';

type ModelDetailProps = {
  project: TrainingProjectType;
};

const theme = getTheme();
const titleStyles: ITextStyles = { root: { fontWeight: 600, fontSize: '16px' } };
const infoBlockTokens: IStackTokens = { childrenGap: 10 };

const ModelDetail: React.FC<ModelDetailProps> = ({ project }) => {
  const dispatch = useDispatch();
  const history = useHistory();

  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'edit',
      text: 'Edit',
      iconProps: {
        iconName: 'Edit',
      },
      onClick: () => setIsPanelOpen(true),
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
                history.push(Url.MODELS);
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
    <>
      <Stack styles={{ root: { height: '100%' } }}>
        <CommandBar
          items={commandBarItems}
          styles={{ root: { borderBottom: `solid 1px ${theme.palette.neutralLight}` } }}
        />
        <Stack tokens={{ childrenGap: 30 }} styles={{ root: { padding: '15px' } }} grow>
          <Breadcrumb items={breadCrumbItems} />
          <Stack tokens={{ childrenGap: 30 }} styles={{ root: { marginLeft: '0.8em' } }}>
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
            <Stack tokens={infoBlockTokens}>
              <Text styles={titleStyles}>Objects</Text>
              <ModelParts projectId={project.id} />
            </Stack>
          </Stack>
        </Stack>
      </Stack>
      <AddModelPanel
        initialValue={{
          name: project.name,
          endPoint: project.predictionUri,
          header: project.predictionHeader,
          labels: '',
          setting: false,
          id: project.id,
        }}
        isOpen={isPanelOpen}
        onDissmiss={() => setIsPanelOpen(false)}
        mode={PanelMode.Update}
      />
    </>
  );
};

export default ModelDetail;

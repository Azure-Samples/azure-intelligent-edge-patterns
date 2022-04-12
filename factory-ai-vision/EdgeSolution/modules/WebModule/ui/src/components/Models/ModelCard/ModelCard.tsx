import React, { useMemo, useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
  Stack,
  Label,
  mergeStyleSets,
  DialogFooter,
  PrimaryButton,
  DefaultButton,
  Dialog,
  IconButton,
  IContextualMenuProps,
  Text,
} from '@fluentui/react';

import { TrainingProject } from '../../../store/trainingProjectSlice';
import { trainingProjectPartsSelectorFactory } from '../../../store/partSlice';
import { deleteTrainingProject } from '../../../store/trainingProjectSlice';
import { Status } from '../../../store/trainingProjectStatusSlice';
import { Url } from '../../../constant';
import { NO_LIMIT_TRAIN_STATUS } from '../type';
import { convertProjectType } from '../../utils';

import Tag from '../Tag';

type Props = {
  project: TrainingProject;
  onSelectedProject: () => void;
  onDismiss: () => void;
  status: Status;
};

const getClasses = () =>
  mergeStyleSets({
    root: {
      width: '300px',
      boxShadow: ' 0px 0.3px 0.9px rgba(0, 0, 0, 0.1), 0px 1.6px 3.6px rgba(0, 0, 0, 0.13)',
      borderRadius: '4px',
      ':hover': {
        boxShadow: ' 0px 0.3px 0.9px rgba(0, 0, 0, 0.5), 0px 1.6px 3.6px rgba(0, 0, 0, 0.5)',
      },
    },
    titleContainer: { borderBottom: '1px solid rgba(0, 0, 0, 0.13)', width: '100%' },
    titleWrapper: { padding: '7px 12px' },
    titleType: { fontSize: '12px', lineHeight: '16px', color: '#605E5C' },
    deleteIcon: {
      padding: '10px',
      marginRight: '12px',
      '& i': {
        fontSize: '24px',
      },
      ':hover': {
        cursor: 'pointer',
      },
    },
  });

const CARD_PART_LIMIT = 5;

const isDeleteDisable = (project: TrainingProject, trainingStatus: Status) => {
  if (project.category === 'openvino') return false;
  if (project.category === 'customvision' && NO_LIMIT_TRAIN_STATUS.includes(trainingStatus.status))
    return false;

  return true;
};

const ModelCard: React.FC<Props> = (props) => {
  const { project, onSelectedProject, status } = props;

  const [isOpenDialog, setIsOpenDialog] = useState(false);

  const partSelector = useMemo(() => trainingProjectPartsSelectorFactory(project.id), [project]);
  const parts = useSelector(partSelector);

  const history = useHistory();
  const dispatch = useDispatch();
  const classes = getClasses();

  const menuProps: IContextualMenuProps = {
    items: [
      {
        key: 'properties',
        text: 'Properties',
        iconProps: { iconName: 'Equalizer' },
        onClick: () => onSelectedProject(),
      },
      {
        key: 'delete',
        text: 'Delete',
        iconProps: { iconName: 'Delete' },
        onClick: () => setIsOpenDialog(true),
        disabled: isDeleteDisable(project, status),
      },
    ],
  };

  const onDeleteModel = useCallback(async () => {
    await dispatch(
      deleteTrainingProject({
        id: project.id,
        resolve: () => {
          history.push(Url.MODELS);
        },
      }),
    );
    setIsOpenDialog(false);
  }, [dispatch, history, project]);

  return (
    <>
      <Stack className={classes.root} onClick={onSelectedProject}>
        <Stack horizontal>
          <img style={{ height: '60px', width: '60px' }} src="/icons/modelCard.png" alt="icon" />
          <Stack horizontal horizontalAlign="space-between" styles={{ root: classes.titleContainer }}>
            <Stack styles={{ root: classes.titleWrapper }}>
              <Label>{project.name}</Label>
              <Text styles={{ root: classes.titleType }}>{convertProjectType(project.projectType)}</Text>
            </Stack>
            <Stack horizontalAlign="center" verticalAlign="center">
              <IconButton
                styles={{ root: classes.deleteIcon }}
                menuProps={menuProps}
                menuIconProps={{ iconName: 'MoreVertical' }}
              />
            </Stack>
          </Stack>
        </Stack>
        <Stack styles={{ root: { padding: '10px 20px 20px' } }}>
          <Label
            styles={{
              root: {
                fontSize: '10px',
                lineHeightL: '14px',
                color: '#605E5C',
              },
            }}
          >
            {project.customVisionId !== '' && 'By Microsoft Custom Vision'}
            {project.category === 'openvino' && 'By Intel'}
          </Label>
          {project.customVisionId !== '' && (
            <Label styles={{ root: { fontSize: '13px', lineHeight: '18px', marginBottom: '10px' } }}>
              Trainable
            </Label>
          )}
          {project.category === 'openvino' && (
            <Stack horizontal tokens={{ childrenGap: '5px' }} wrap>
              {project.outputs
                .filter((output) => output.metadata.labels)
                .map((output) =>
                  output.metadata.labels.map((label, id) => <Tag key={id} id={id} text={label} />),
                )}
            </Stack>
          )}
          <Stack horizontal tokens={{ childrenGap: '5px' }} wrap>
            {parts
              .filter((_, i) => i < CARD_PART_LIMIT)
              .map((part, id) => (
                <Tag key={id} id={id} text={part.name} />
              ))}
            {parts.length > CARD_PART_LIMIT && (
              <span
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  color: '#0078D4',
                }}
              >{`+${parts.length - CARD_PART_LIMIT} more`}</span>
            )}
          </Stack>
        </Stack>
      </Stack>
      <Dialog
        dialogContentProps={{
          title: `Delete ‘${project.name}’`,
          subText: `This action will permanently delete the model ‘${project.name}’.`,
        }}
        minWidth={1068}
        maxWidth={1068}
        hidden={!isOpenDialog}
        onDismiss={() => setIsOpenDialog(false)}
      >
        <DialogFooter styles={{ actionsRight: { textAlign: 'left' } }}>
          <PrimaryButton text="Delete" onClick={onDeleteModel} />
          <DefaultButton text="Cancel" onClick={() => setIsOpenDialog(false)} />
        </DialogFooter>
      </Dialog>
    </>
  );
};

export default ModelCard;

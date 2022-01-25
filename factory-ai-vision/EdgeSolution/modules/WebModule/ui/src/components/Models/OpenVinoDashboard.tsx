import React, { useState, useCallback } from 'react';
import {
  SearchBox,
  Stack,
  mergeStyleSets,
  Label,
  IContextualMenuProps,
  IconButton,
  PrimaryButton,
  Text,
} from '@fluentui/react';
import { useDispatch } from 'react-redux';

import { IntelProject, createIntelProject } from '../../store/IntelProjectSlice';
import { TrainingProject } from '../../store/trainingProjectSlice';
import { convertProjectType } from '../utils';

import Tag from './Tag';
import AddOpenVinoPanel from './Panel/AddOpenVinoPanel';

const CARD_PART_LIMIT = 5;

interface Props {
  intelProjectList: IntelProject[];
  openVinoProjectList: TrainingProject[];
  onCloseIntel: () => void;
}

const getClasses = () =>
  mergeStyleSets({
    root: {
      width: '320px',
      height: '266px',
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

const isDisableAddButton = (intel: IntelProject, openVinoList: TrainingProject[]) => {
  if (openVinoList.length === 0) return false;
  if (!openVinoList.map((project) => project.openvino_model_name).includes(intel.model_name)) return false;
  return true;
};

const getFilterProjects = (projects: IntelProject[], input: string) => {
  return projects.filter((project) => project.name.match(input));
};

const getExceededName = (name: string) => (name.length > 24 ? `${name.slice(0, 24)}...` : name);

const IntelProjectDashboard = (props: Props) => {
  const { intelProjectList, onCloseIntel, openVinoProjectList } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(0);
  const [localProjectList, setLocalProjectList] = useState<IntelProject[]>(intelProjectList);

  const dispatch = useDispatch();
  const classes = getClasses();

  const onCreateIntelModel = useCallback(
    async (cascade: IntelProject) => {
      await dispatch(
        createIntelProject({ create_name: cascade.create_name, project_type: cascade.model_type }),
      );

      onCloseIntel();
    },
    [dispatch, onCloseIntel],
  );

  const onSearch = useCallback(
    (value: string) => {
      setLocalProjectList(getFilterProjects(intelProjectList, value));
    },
    [intelProjectList],
  );

  const menuProps: IContextualMenuProps = {
    items: [
      {
        key: 'properties',
        text: 'Properties',
        iconProps: { iconName: 'Equalizer' },
        onClick: () => setIsOpen(true),
      },
      {
        key: 'delete',
        text: 'Delete',
        iconProps: { iconName: 'Delete' },
      },
    ],
  };

  return (
    <>
      <Stack tokens={{ childrenGap: 45 }}>
        <SearchBox
          styles={{ root: { width: '470px' } }}
          placeholder="Search"
          onSearch={onSearch}
          onClear={() => setLocalProjectList(intelProjectList)}
          onChange={(_, value) => {
            if (value === '') setLocalProjectList(intelProjectList);
          }}
        />
        <Stack horizontal wrap tokens={{ childrenGap: 16 }}>
          {localProjectList.length > 0 &&
            localProjectList.map((card, id) => (
              <Stack
                key={id}
                className={classes.root}
                onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.preventDefault();

                  setSelectedId(id);
                  setIsOpen(true);
                }}
              >
                <Stack horizontal>
                  <img style={{ height: '60px', width: '60px' }} src="/icons/modelCard.png" alt="icon" />
                  <Stack horizontal horizontalAlign="space-between" styles={{ root: classes.titleContainer }}>
                    <Stack styles={{ root: classes.titleWrapper }}>
                      <Label>{getExceededName(card.name)}</Label>
                      <Text styles={{ root: classes.titleType }}>{convertProjectType(card.model_type)}</Text>
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
                <Stack styles={{ root: { padding: '10px 20px 12px', height: '100%', position: 'relative' } }}>
                  <Label
                    styles={{
                      root: {
                        fontSize: '10px',
                        lineHeightL: '14px',
                        color: '#605E5C',
                      },
                    }}
                  >
                    By Intel
                  </Label>
                  {card.createdAt && (
                    <Label styles={{ root: { fontSize: '13px', lineHeight: '18px', marginBottom: '10px' } }}>
                      {`Updated: ${card.createdAt}`}
                    </Label>
                  )}
                  <Stack horizontal tokens={{ childrenGap: '5px' }} wrap>
                    {card.tags
                      .filter((_, i) => i < CARD_PART_LIMIT)
                      .map((part, id) => (
                        <Tag key={id} id={id} text={part} />
                      ))}
                    {card.tags.length > CARD_PART_LIMIT && (
                      <span
                        style={{
                          padding: '4px 8px',
                          fontSize: '12px',
                          color: '#0078D4',
                        }}
                      >{`+${card.tags.length - CARD_PART_LIMIT} more`}</span>
                    )}
                  </Stack>
                  <div
                    style={{
                      textAlign: 'left',
                      marginTop: '34px',
                      position: 'absolute',
                      right: '10px',
                      bottom: '10px',
                    }}
                  >
                    <PrimaryButton
                      id="test"
                      text="Add"
                      disabled={isDisableAddButton(card, openVinoProjectList)}
                      onClick={(e) => {
                        e.stopPropagation();

                        onCreateIntelModel(card);
                      }}
                    />
                  </div>
                </Stack>
              </Stack>
            ))}
        </Stack>
      </Stack>
      <AddOpenVinoPanel
        isOpen={isOpen}
        onDissmiss={() => setIsOpen(false)}
        intel={intelProjectList[selectedId]}
        onClickAddModel={() => onCreateIntelModel(intelProjectList[selectedId])}
        isAddIntel={isDisableAddButton(intelProjectList[selectedId], openVinoProjectList)}
      />
    </>
  );
};

export default IntelProjectDashboard;

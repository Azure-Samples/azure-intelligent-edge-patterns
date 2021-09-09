import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
  DetailsList,
  CheckboxVisibility,
  Spinner,
  SpinnerSize,
  CommandBar,
  ICommandBarItemProps,
  getTheme,
  Stack,
} from '@fluentui/react';

import { getParts, Part } from '../../store/partSlice';
import { selectProjectPartsFactory } from '../../store/selectors';

import { Url } from '../../enums';

import { EmptyAddIcon } from '../EmptyAddIcon';
import { AddEditPartPanel, PanelMode } from '../AddPartPanel';

interface Props {
  projectId: number;
}

const theme = getTheme();

const PartDetailList: React.FC<Props> = (props) => {
  const { projectId } = props;

  const [loading, setLoading] = useState(false);
  const [isOpenPanel, setIsOpenPanel] = useState(false);

  const imgAnnoSelector = useMemo(() => selectProjectPartsFactory(projectId), [projectId]);
  const parts = useSelector(imgAnnoSelector);

  const dispatch = useDispatch();
  const history = useHistory();

  const onRowClick = (item: Part) => {
    history.push(`${Url.MODELS_OBJECTS}?partId=${item.id}`);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await dispatch(getParts());
      setLoading(false);
    })();
  }, [dispatch]);

  const commandBarItems: ICommandBarItemProps[] = useMemo(
    () => [
      {
        key: 'addBtn',
        text: 'Add',
        iconProps: {
          iconName: 'Add',
        },
        onClick: () => setIsOpenPanel(true),
      },
    ],
    [],
  );

  if (loading) return <Spinner size={SpinnerSize.large} />;

  return (
    <>
      {parts.length === 0 ? (
        <EmptyAddIcon
          subTitle="Add a object to tag your photo"
          title="Add a tag"
          // primary={{ text: 'Add a object', onClick: onAddBtnClick }}
        />
      ) : (
        <>
          <CommandBar
            items={commandBarItems}
            styles={{ root: { borderBottom: `solid 1px ${theme.palette.neutralLight}` } }}
          />
          <Stack styles={{ root: { marginLeft: '24px' } }}>
            <DetailsList
              columns={[{ key: 'name', minWidth: 0, name: 'Name', fieldName: 'name' }]}
              items={parts}
              checkboxVisibility={CheckboxVisibility.hidden}
              onActiveItemChanged={onRowClick}
            />
            <AddEditPartPanel
              isOpen={isOpenPanel}
              onDissmiss={() => setIsOpenPanel(false)}
              mode={PanelMode.Create}
              projectId={projectId}
            />
          </Stack>
        </>
      )}
    </>
  );
};

export default PartDetailList;

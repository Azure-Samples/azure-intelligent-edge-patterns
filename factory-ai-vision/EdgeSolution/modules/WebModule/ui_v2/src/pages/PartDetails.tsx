import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Link, useHistory } from 'react-router-dom';
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
  Spinner,
  MessageBar,
  MessageBarButton,
  ActionButton,
} from '@fluentui/react';
import { useSelector, useDispatch } from 'react-redux';

import { State } from 'RootStateType';
import { useQuery } from '../hooks/useQuery';
import { selectPartById, getParts, deletePart } from '../store/partSlice';
import { RTSPVideo } from '../components/RTSPVideo';
import { thunkGetProject } from '../store/project/projectActions';
import { AddEditPartPanel, PanelMode } from '../components/AddPartPanel';
import { selectLocationById } from '../store/locationSlice';
import LabelingPage, { LabelPageMode } from '../components/LabelingPage/LabelingPage';
import { captureImage } from '../store/imageSlice';
import { Images } from '../pages/Images';

const theme = getTheme();
const titleStyles: ITextStyles = { root: { fontWeight: 600, fontSize: '16px' } };
const infoBlockTokens: IStackTokens = { childrenGap: 10 };

export const PartDetails: React.FC = () => {
  const partId = parseInt(useQuery().get('partId'), 10);
  const part = useSelector((state: State) => selectPartById(state, partId));
  //const locationName = useSelector((state: State) => selectLocationById(state, camera?.location)?.name);
  //const projectCameraId = useSelector((state: State) => state.project.data.camera);
  const dispatch = useDispatch();
  const history = useHistory();

  const [editPanelOpen, setEditPanelOpen] = useState(false);
  const openPanel = () => setEditPanelOpen(true);
  const closePanel = () => setEditPanelOpen(false);

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'edit',
      text: 'Edit',
      iconProps: {
        iconName: 'Edit',
      },
      onClick: openPanel,
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

          await dispatch(deletePart(partId));
          history.push('/parts');
        })();
      },
    },
  ];

  useEffect(() => {
    dispatch(getParts(false));
    dispatch(thunkGetProject());
  }, [dispatch]);

  const onCaptureBtnClick = (streamId) => {
    dispatch(captureImage({ streamId, imageIds: [], shouldOpenLabelingPage: true }));
  };

  if (part === undefined) return <Spinner label="Loading" />;

  const breadCrumbItems: IBreadcrumbItem[] = [
    { key: 'parts', text: 'Parts', href: '/parts' },
    { key: part.name, text: part.name },
  ];

  // FIXME andrew help!
  const numImages = 1;

  return (
    <>
      <Stack styles={{ root: { height: '100%' } }}>
        <CommandBar
          items={commandBarItems}
          styles={{ root: { borderBottom: `solid 1px ${theme.palette.neutralLight}` } }}
        />
        <Stack tokens={{ childrenGap: 30 }} styles={{ root: { padding: '15px' } }} grow>
          <Breadcrumb items={breadCrumbItems} />
          <Stack tokens={{ childrenGap: 20 }} horizontal grow>
            <PartInfo description={part.description} numImages={numImages} />
          </Stack>
        </Stack>
        <Images></Images>
        <AddEditPartPanel
          isOpen={editPanelOpen}
          onDissmiss={closePanel}
          mode={PanelMode.Update}
          initialValue={{
            name: { value: part.name, errMsg: '' },
            description: { value: part.description, errMsg: '' },
          }}
          partId={partId}
        />
      </Stack>
    </>
  );
};

const PartInfo: React.FC<{ description: string; numImages: number }> = ({ description, numImages }) => (
  <Stack tokens={{ childrenGap: 30 }} styles={{ root: { width: '100%', marginLeft: '0.8em' } }}>
    <Stack tokens={infoBlockTokens}>
      <Text styles={titleStyles}>Description</Text>
      <Text block nowrap>
        {description}
      </Text>
    </Stack>
    <Stack tokens={infoBlockTokens}>
      <Text styles={titleStyles}>Images</Text>
      <Text>
        <b>{numImages} images</b> have been trained for this part
      </Text>
    </Stack>
  </Stack>
);

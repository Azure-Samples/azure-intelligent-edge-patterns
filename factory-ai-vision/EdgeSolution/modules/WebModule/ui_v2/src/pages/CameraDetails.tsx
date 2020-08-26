import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
import { useQuery } from '../hooks/useQuery';
import { State } from 'RootStateType';
import { useSelector, useDispatch } from 'react-redux';
import { selectCameraById, getCameras } from '../store/cameraSlice';
import { RTSPVideo } from '../components/RTSPVideo';
import { thunkGetProject } from '../store/project/projectActions';
import { CaptureDialog } from '../components/CaptureDialog';

const theme = getTheme();
const titleStyles: ITextStyles = { root: { fontWeight: 600, fontSize: '16px' } };
const infoBlockTokens: IStackTokens = { childrenGap: 10 };

export const CameraDetails: React.FC = () => {
  const camerId = parseInt(useQuery().get('cameraId'), 10);
  const camera = useSelector((state: State) => selectCameraById(state, camerId));
  const projectCameraId = useSelector((state: State) => state.project.data.camera);
  const dispatch = useDispatch();

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'edit',
      text: 'Edit',
      iconProps: {
        iconName: 'Edit',
      },
    },
    {
      key: 'delete',
      text: 'Delete',
      iconProps: {
        iconName: 'Delete',
      },
    },
  ];

  useEffect(() => {
    dispatch(getCameras(false));
    dispatch(thunkGetProject(false));
  }, [dispatch]);

  const [captureDialogOpen, setCaptureDialogOpen] = useState(false);
  const openDialog = () => setCaptureDialogOpen(true);
  const closeDialog = () => setCaptureDialogOpen(false);

  if (camera === undefined) return <Spinner label="Loading" />;

  const breadCrumbItems: IBreadcrumbItem[] = [
    { key: 'cameras', text: 'Cameras', href: '/cameras' },
    { key: camera.name, text: camera.name },
  ];

  const isCameraInUsed = projectCameraId === camerId;

  return (
    <>
      <Stack styles={{ root: { height: '100%' } }}>
        <CommandBar
          items={commandBarItems}
          styles={{ root: { borderBottom: `solid 1px ${theme.palette.neutralLight}` } }}
        />
        <CameraInUsedMsgBar isInUsed={isCameraInUsed} />
        <Stack tokens={{ childrenGap: 30 }} styles={{ root: { padding: '15px' } }} grow>
          <Breadcrumb items={breadCrumbItems} />
          <Stack tokens={{ childrenGap: 20 }} horizontal grow>
            <CameraInfo rtsp={camera.rtsp} location="" />
            <CameraLiveFeed rtsp={camera.rtsp} onBtnClick={openDialog} />
          </Stack>
        </Stack>
      </Stack>
      <CaptureDialog
        isOpen={captureDialogOpen}
        onDismiss={closeDialog}
        captureLabelMode={1}
        defaultSelectedCameraId={camerId}
      />
    </>
  );
};

const CameraInUsedMsgBar: React.FC<{ isInUsed: boolean }> = ({ isInUsed }) => {
  const [visible, setVisible] = useState(true);

  if (isInUsed && visible)
    return (
      <MessageBar
        actions={
          <Link to="/task">
            <MessageBarButton>View Task</MessageBarButton>
          </Link>
        }
        onDismiss={() => setVisible(false)}
        isMultiline={false}
      >
        This camera is currently in use.
      </MessageBar>
    );

  return null;
};

const CameraInfo: React.FC<{ rtsp: string; location: string }> = ({ rtsp, location }) => (
  <Stack tokens={{ childrenGap: 30 }} styles={{ root: { width: '20%', marginLeft: '0.8em' } }}>
    <Stack tokens={infoBlockTokens}>
      <Text styles={titleStyles}>RTSP URL</Text>
      <Text block nowrap>
        {rtsp}
      </Text>
    </Stack>
    <Stack tokens={infoBlockTokens}>
      <Text styles={titleStyles}>Location</Text>
      <Text>{/**TODO add location */}</Text>
    </Stack>
  </Stack>
);

const CameraLiveFeed: React.FC<{ rtsp: string; onBtnClick: () => void }> = ({ rtsp, onBtnClick }) => {
  return (
    <Stack style={{ width: '80%' }}>
      <Text styles={titleStyles}>Live feed</Text>
      <ActionButton iconProps={{ iconName: 'Camera' }} onClick={onBtnClick}>
        Capture image
      </ActionButton>
      <Stack.Item grow>
        <div style={{ height: '90%' }}>
          <RTSPVideo rtsp={rtsp} canCapture autoPlay onCapturePhoto={() => {}} />
        </div>
      </Stack.Item>
    </Stack>
  );
};

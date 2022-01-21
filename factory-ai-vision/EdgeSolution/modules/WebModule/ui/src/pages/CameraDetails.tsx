import React from 'react';

import { CameraDetails as CameraDetailsComponent } from '../components/CameraDetail/CameraDetail';

const CameraDetails = () => {
  return <CameraDetailsComponent />;
};

export default CameraDetails;

// import React, { useEffect, useState, useRef } from 'react';
// import { Link, useHistory } from 'react-router-dom';
// import {
//   Breadcrumb,
//   Stack,
//   CommandBar,
//   ICommandBarItemProps,
//   getTheme,
//   IBreadcrumbItem,
//   Text,
//   IStackTokens,
//   ITextStyles,
//   Spinner,
//   MessageBar,
//   MessageBarButton,
//   ActionButton,
// } from '@fluentui/react';
// import { useSelector, useDispatch } from 'react-redux';
// import { useBoolean } from '@uifabric/react-hooks';

// import { State } from 'RootStateType';
// import { useQuery } from '../hooks/useQuery';
// import { selectCameraById, getCameras, deleteCamera } from '../store/cameraSlice';
// import { RTSPVideo } from '../components/RTSPVideo';
// import { thunkGetProject } from '../store/project/projectActions';
// import AddCameraPanel, { PanelMode } from '../components/AddCameraPanel';
// import { selectLocationById } from '../store/locationSlice';
// import LabelingPage from '../components/LabelingPage/LabelingPage';
// import { captureImage } from '../store/imageSlice';
// import { maskRtsp } from '../utils/maskRTSP';

// const theme = getTheme();
// const titleStyles: ITextStyles = { root: { fontWeight: 600, fontSize: '16px' } };
// const infoBlockTokens: IStackTokens = { childrenGap: 10 };

// export const CameraDetails: React.FC = () => {
//   const cameraId = parseInt(useQuery().get('cameraId'), 10);
//   const camera = useSelector((state: State) => selectCameraById(state, cameraId));
//   const locationName = useSelector((state: State) => selectLocationById(state, camera?.location)?.name);
//   const projectCameraId = useSelector((state: State) => state.project.data.cameras);
//   const dispatch = useDispatch();
//   const history = useHistory();

//   const [editPanelOpen, { setTrue: openPanel, setFalse: closePanel }] = useBoolean(false);

//   const commandBarItems: ICommandBarItemProps[] = [
//     {
//       key: 'edit',
//       text: 'Edit',
//       iconProps: {
//         iconName: 'Edit',
//       },
//       onClick: openPanel,
//     },
//     {
//       key: 'delete',
//       text: 'Delete',
//       iconProps: {
//         iconName: 'Delete',
//       },
//       onClick: () => {
//         // Because onClick cannot accept the return type Promise<void>, use the IIFE to workaround
//         (async () => {
//           // eslint-disable-next-line no-restricted-globals
//           if (!confirm('Sure you want to delete?')) return;

//           await dispatch(deleteCamera(cameraId));
//           history.push('/cameras');
//         })();
//       },
//     },
//   ];

//   useEffect(() => {
//     dispatch(getCameras(false));
//     dispatch(thunkGetProject());
//   }, [dispatch]);

//   const onCaptureBtnClick = (streamId) => {
//     dispatch(captureImage({ streamId, imageIds: [], shouldOpenLabelingPage: true }));
//   };

//   if (camera === undefined) return <Spinner label="Loading" />;

//   const breadCrumbItems: IBreadcrumbItem[] = [
//     {
//       key: 'cameras',
//       text: 'Cameras',
//       href: '/cameras',
//       onClick: (ev, item) => {
//         ev.preventDefault();
//         history.push(item.href);
//       },
//     },
//     { key: camera.name, text: camera.name },
//   ];

//   const isCameraInUsed = projectCameraId.includes(cameraId);

//   return (
//     <>
//       <Stack styles={{ root: { height: '100%' } }}>
//         <CommandBar
//           items={commandBarItems}
//           styles={{ root: { borderBottom: `solid 1px ${theme.palette.neutralLight}` } }}
//         />
//         <CameraInUsedMsgBar isInUsed={isCameraInUsed} />
//         <Stack tokens={{ childrenGap: 30 }} styles={{ root: { padding: '15px' } }} grow>
//           <Breadcrumb items={breadCrumbItems} />
//           <Stack tokens={{ childrenGap: 20 }} horizontal grow>
//             <CameraInfo rtsp={maskRtsp(camera.rtsp)} location={locationName} />
//             <CameraLiveFeed cameraId={camera.id} onBtnClick={onCaptureBtnClick} />
//           </Stack>
//         </Stack>
//       </Stack>
//       <LabelingPage />
//       <AddCameraPanel
//         isOpen={editPanelOpen}
//         onDissmiss={closePanel}
//         mode={PanelMode.Update}
//         initialValue={{
//           name: { value: camera.name, errMsg: '' },
//           url: { value: camera.rtsp, errMsg: '' },
//           location: { value: camera.location, errMsg: '' },
//         }}
//         cameraId={cameraId}
//       />
//     </>
//   );
// };

// const CameraInUsedMsgBar: React.FC<{ isInUsed: boolean }> = ({ isInUsed }) => {
//   const [visible, setVisible] = useState(true);

//   if (isInUsed && visible)
//     return (
//       <MessageBar
//         actions={
//           <Link to="/task">
//             <MessageBarButton>View Task</MessageBarButton>
//           </Link>
//         }
//         onDismiss={() => setVisible(false)}
//         isMultiline={false}
//       >
//         This camera is currently in use.
//       </MessageBar>
//     );

//   return null;
// };

// const CameraInfo: React.FC<{ rtsp: string; location: string }> = ({ rtsp, location }) => (
//   <Stack tokens={{ childrenGap: 30 }} styles={{ root: { width: '20%', marginLeft: '0.8em' } }}>
//     <Stack tokens={infoBlockTokens}>
//       <Text styles={titleStyles}>RTSP URL</Text>
//       <Text block nowrap>
//         {rtsp}
//       </Text>
//     </Stack>
//     <Stack tokens={infoBlockTokens}>
//       <Text styles={titleStyles}>Location</Text>
//       <Text>{location}</Text>
//     </Stack>
//   </Stack>
// );

// const CameraLiveFeed: React.FC<{ cameraId: number; onBtnClick: (streamId) => void }> = ({
//   cameraId,
//   onBtnClick: btnClickCb,
// }) => {
//   const streamIdRef = useRef('');

//   const onBtnClick = () => btnClickCb(streamIdRef.current);

//   return (
//     <Stack style={{ width: '80%' }}>
//       <Text styles={{ root: { fontWeight: 600, fontSize: '16px' } }}>Live feed</Text>
//       <ActionButton iconProps={{ iconName: 'Camera' }} onClick={onBtnClick}>
//         Capture image
//       </ActionButton>
//       <Stack.Item grow>
//         <div style={{ height: '90%' }}>
//           <RTSPVideo
//             cameraId={cameraId}
//             onStreamCreated={(streamId) => {
//               streamIdRef.current = streamId;
//             }}
//           />
//         </div>
//       </Stack.Item>
//     </Stack>
//   );
// };

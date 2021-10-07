import React, { useEffect, useRef, useMemo } from 'react';
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
  Spinner,
} from '@fluentui/react';
import { useSelector, useDispatch } from 'react-redux';
import { useBoolean } from '@uifabric/react-hooks';

import { State } from 'RootStateType';
import { useQuery } from '../hooks/useQuery';
import { selectPartById, getParts, deletePart } from '../store/partSlice';
import { thunkGetProject } from '../store/project/projectActions';
import { EmptyAddIcon } from '../components/EmptyAddIcon';
import { postImages, getImages } from '../store/imageSlice';
import { partImageItemSelectorFactory } from '../store/selectors';

import { Url } from '../constant';

import LabelingPage from '../components/LabelingPage/LabelingPage';
import { AddEditPartPanel, PanelMode } from '../components/AddPartPanel';
import { ImageList } from '../components/ImageList';
import { CaptureDialog } from '../components/CaptureDialog';

const theme = getTheme();
const titleStyles: ITextStyles = { root: { fontWeight: 600, fontSize: '16px' } };
const infoBlockTokens: IStackTokens = { childrenGap: 10 };

export const PartDetails: React.FC = () => {
  const partId = parseInt(useQuery().get('partId'), 10);
  const part = useSelector((state: State) => selectPartById(state, partId));
  const dispatch = useDispatch();
  const history = useHistory();

  const [editPanelOpen, { setTrue: openPanel, setFalse: closePanel }] = useBoolean(false);

  // Create a memoized selector so the selector factory won't return different selectors every render
  const labeledImagesSelector = useMemo(() => partImageItemSelectorFactory(partId), [partId]);
  const labeledImages = useSelector(labeledImagesSelector);

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
          history.push(Url.PARTS);
        })();
      },
    },
  ];

  useEffect(() => {
    dispatch(getParts());
    dispatch(thunkGetProject());
  }, [dispatch]);

  if (part === undefined) return <Spinner label="Loading" />;

  const breadCrumbItems: IBreadcrumbItem[] = [
    {
      key: 'parts',
      text: 'Objects',
      href: '/parts',
      onClick: (ev, item) => {
        // Default behaviour will reload the entire page.
        // Prevent this behaviour and use react-router-dom instead
        ev.preventDefault();
        history.push(item.href);
      },
    },
    { key: part.name, text: part.name },
  ];

  const numImages = labeledImages.length;

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
        <Images labeledImages={labeledImages}></Images>
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
        <b>{numImages} images</b> have been trained for this object
      </Text>
    </Stack>
  </Stack>
);

export const Images: React.FC<{ labeledImages }> = ({ labeledImages }) => {
  const [isCaptureDialgOpen, { setTrue: openCaptureDialog, setFalse: closeCaptureDialog }] = useBoolean(
    false,
  );
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const partId = parseInt(useQuery().get('partId'), 10);

  const onUpload = () => {
    fileInputRef.current.click();
  };

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>): void {
    for (let i = 0; i < e.target.files.length; i++) {
      const formData = new FormData();
      formData.append('image', e.target.files[i]);
      dispatch(postImages(formData));
    }
  }

  const commandBarItems: ICommandBarItemProps[] = useMemo(
    () => [
      {
        key: 'uploadImages',
        text: 'Upload images',
        iconProps: {
          iconName: 'Upload',
        },
        onClick: onUpload,
      },
      {
        key: 'captureFromCamera',
        text: 'Capture from camera',
        iconProps: {
          iconName: 'Camera',
        },
        onClick: openCaptureDialog,
      },
    ],
    [openCaptureDialog],
  );

  useEffect(() => {
    dispatch(getImages({ freezeRelabelImgs: false }));
    // Image list items need part info
    dispatch(getParts());
  }, [dispatch]);

  return (
    <>
      <Stack styles={{ root: { height: '100%' } }}>
        <CommandBar
          items={commandBarItems}
          styles={{ root: { borderBottom: `solid 1px ${theme.palette.neutralLight}` } }}
        />
        <div style={{ padding: '15px' }}>
          {labeledImages.length ? (
            <ImageList images={labeledImages} />
          ) : (
            <EmptyAddIcon
              title="Add images"
              subTitle="Capture images from your video streams and tag parts"
              primary={{ text: 'Capture from camera', onClick: openCaptureDialog }}
              secondary={{ text: 'Upload images', onClick: onUpload }}
            />
          )}
        </div>
      </Stack>
      {/* <CaptureDialog isOpen={isCaptureDialgOpen} onDismiss={closeCaptureDialog} partId={partId} />
      <LabelingPage onSaveAndGoCaptured={openCaptureDialog} projectId="13" /> */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleUpload}
        accept="image/*"
        multiple
        style={{ display: 'none' }}
      />
    </>
  );
};

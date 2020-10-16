import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ICommandBarItemProps,
  Stack,
  CommandBar,
  getTheme,
  Breadcrumb,
  Pivot,
  PivotItem,
  MessageBar,
  Separator,
  mergeStyleSets,
  ContextualMenuItemType,
} from '@fluentui/react';
import { useDispatch, useSelector } from 'react-redux';
import Axios from 'axios';

import { State } from 'RootStateType';
import { EmptyAddIcon } from '../components/EmptyAddIcon';
import { CaptureDialog } from '../components/CaptureDialog';
import { postImages, getImages, selectAllImages } from '../store/imageSlice';
import { ImageList, Item } from '../components/ImageList';
import { imageItemSelectorFactory, relabelImageSelector, selectNonDemoPart } from '../store/selectors';
import { getParts } from '../store/partSlice';
import LabelingPage from '../components/LabelingPage/LabelingPage';
import { useInterval } from '../hooks/useInterval';
import { Instruction } from '../components/Instruction';
import { Status } from '../store/project/projectTypes';
import { selectNonDemoCameras } from '../store/cameraSlice';

const theme = getTheme();
const classes = mergeStyleSets({
  seperator: {
    margin: '20px 0px',
  },
});

const labeledImagesSelector = imageItemSelectorFactory(false);
const unlabeledImagesSelector = imageItemSelectorFactory(true);

const onToggleFilterItem = (targetItem: number) => (allItems: Record<number, boolean>) => ({
  ...allItems,
  [targetItem]: !allItems[targetItem],
});
/**
 * A hooks that return the command bar items of filter object and the selected filter object id
 * @param selector The redux selector of the item
 */
function useFilterItems<T extends { id: number; name: string }>(
  selector: (state: State) => T[],
): [ICommandBarItemProps[], string[]] {
  const [filterItems, setFilterItems] = useState({});
  const itemsInStore = useSelector(selector);
  const items: ICommandBarItemProps[] = useMemo(
    () =>
      itemsInStore.map((c) => ({
        key: c.id.toString(),
        text: c.name,
        canCheck: true,
        checked: filterItems[c.id],
        onClick: () => setFilterItems(onToggleFilterItem(c.id)),
      })),
    [itemsInStore, filterItems],
  );

  return [items, Object.keys(filterItems).filter((e) => filterItems[e])];
}

function filterImgs(imgs: Item[], filterCameras: string[], filterParts: string[]): Item[] {
  let filteredImgs = imgs;
  if (filterCameras.length)
    filteredImgs = filteredImgs.filter((img) => filterCameras.includes(img.camera.id?.toString()));
  if (filterParts.length)
    filteredImgs = filteredImgs.filter((img) => filterParts.includes(img.part.id?.toString()));
  return filteredImgs;
}

export const Images: React.FC = () => {
  const [isCaptureDialgOpen, setCaptureDialogOpen] = useState(false);
  const openCaptureDialog = () => setCaptureDialogOpen(true);
  const closeCaptureDialog = () => setCaptureDialogOpen(false);
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const labeledImages = useSelector(labeledImagesSelector);
  const unlabeledImages = useSelector(unlabeledImagesSelector);
  const relabelImages = useSelector(relabelImageSelector);
  const nonDemoProjectId = useSelector((state: State) => state.trainingProject.nonDemo[0]);
  const imageAddedButNoAnno = useSelector(
    (state: State) => state.labelImages.ids.length > 0 && state.annotations.ids.length === 0,
  );
  const labeledImagesLessThanFifteen = useSelector(
    (state: State) => state.annotations.ids.length > 0 && labeledImages.length < 15,
  );
  const imageIsEnoughForTraining = useSelector(
    (state: State) => state.project.status === Status.None && labeledImages.length >= 15,
  );
  const relabelImgsReadyToTrain = useSelector(
    (state: State) =>
      selectAllImages(state).filter((e) => e.isRelabel && e.manualChecked && !e.uploaded).length,
  );

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
    [],
  );

  const [cameraItems, filteredCameras] = useFilterItems(selectNonDemoCameras);
  const [partItems, filteredParts] = useFilterItems(selectNonDemoPart);

  const filteredLabeledImgs = filterImgs(labeledImages, filteredCameras, filteredParts);
  const filteredRelabelImgs = filterImgs(relabelImages, filteredCameras, filteredParts);
  const filteredUnlabelImgs = filterImgs(unlabeledImages, filteredCameras, filteredParts);

  const commandBarFarItems: ICommandBarItemProps[] = useMemo(
    () => [
      {
        key: 'filter',
        iconOnly: true,
        iconProps: { iconName: filteredCameras.length || filteredParts.length ? 'FilterSolid' : 'Filter' },
        subMenuProps: {
          items: [
            {
              key: 'byPart',
              text: 'Filter by object',
              itemType: ContextualMenuItemType.Header,
            },
            ...partItems,
            {
              key: 'byCamera',
              text: 'Filter by camera',
              itemType: ContextualMenuItemType.Header,
            },
            ...cameraItems,
          ],
        },
      },
    ],
    [cameraItems, partItems],
  );

  useEffect(() => {
    dispatch(getImages());
    // For image list items
    dispatch(getParts());
  }, [dispatch]);

  useInterval(
    () => {
      Axios.post(`/api/projects/${nonDemoProjectId}/relabel_keep_alive/`);
    },
    relabelImages.length > 0 ? 3000 : null,
  );

  const onRenderInstructionInsidePivot = () => (
    <>
      {imageAddedButNoAnno && (
        <Instruction
          title="Successfully added images!"
          subtitle="Now identify what is in your images to start training your model."
          smallIcon
        />
      )}
      {labeledImagesLessThanFifteen && (
        <Instruction
          title="Images have been tagged!"
          subtitle="Continue adding and tagging more images to improve your model. We recommend at least 15 images per object."
          smallIcon
        />
      )}
    </>
  );

  return (
    <>
      <Stack styles={{ root: { height: '100%' } }}>
        <CommandBar
          items={commandBarItems}
          styles={{ root: { borderBottom: `solid 1px ${theme.palette.neutralLight}` } }}
          farItems={commandBarFarItems}
        />
        <Stack styles={{ root: { padding: '15px' } }} grow>
          {imageIsEnoughForTraining && (
            <Instruction
              title="Successfully added and tagged enough photos!"
              subtitle="Now you can start deploying your model."
              button={{ text: 'Go to Home', to: '/home/customize' }}
            />
          )}
          {relabelImgsReadyToTrain > 0 && (
            <Instruction
              title={`${relabelImgsReadyToTrain} images saved from the current deployment have been tagged!`}
              subtitle="Update the deployment to retrain the model"
              button={{
                text: 'Update model',
                to: '/home/deployment',
              }}
            />
          )}
          <Breadcrumb items={[{ key: 'images', text: 'Images' }]} />
          {labeledImages.length + unlabeledImages.length ? (
            <Pivot>
              <PivotItem headerText="Untagged">
                {onRenderInstructionInsidePivot()}
                {unlabeledImages.length === 0 && relabelImages.length === 0 ? (
                  <EmptyAddIcon
                    title="Looks like you don’t have any untagged images"
                    subTitle="Continue adding and tagging more images from your video streams to improve your model"
                    primary={{ text: 'Capture from camera', onClick: openCaptureDialog }}
                    secondary={{ text: 'Upload images', onClick: onUpload }}
                  />
                ) : (
                  <>
                    <Separator alignContent="start" className={classes.seperator}>
                      Deployment captures
                    </Separator>
                    {relabelImages.length > 0 && (
                      <MessageBar styles={{ root: { margin: '12px 0px' } }}>
                        Images saved from the current deployment. Confirm or modify the objects identified to
                        improve your model.
                      </MessageBar>
                    )}
                    <ImageList images={filteredRelabelImgs} />
                    <Separator alignContent="start" className={classes.seperator}>
                      Manually added
                    </Separator>
                    <ImageList images={filteredUnlabelImgs} />
                  </>
                )}
              </PivotItem>
              <PivotItem headerText="Tagged">
                {onRenderInstructionInsidePivot()}
                <ImageList images={filteredLabeledImgs} />
              </PivotItem>
            </Pivot>
          ) : (
            <EmptyAddIcon
              title="Add images"
              subTitle="Capture images from your video streams and tag parts"
              primary={{ text: 'Capture from camera', onClick: openCaptureDialog }}
              secondary={{ text: 'Upload images', onClick: onUpload }}
            />
          )}
        </Stack>
      </Stack>
      <CaptureDialog isOpen={isCaptureDialgOpen} onDismiss={closeCaptureDialog} />
      <LabelingPage onSaveAndGoCaptured={openCaptureDialog} />
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

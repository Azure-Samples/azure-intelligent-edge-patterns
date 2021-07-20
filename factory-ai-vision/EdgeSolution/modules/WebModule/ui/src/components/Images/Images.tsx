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
import { useBoolean } from '@uifabric/react-hooks';

import { State } from 'RootStateType';
import { postImages, getImages, selectAllImages } from '../../store/imageSlice';
import { imageItemSelectorFactory, relabelImageSelector, selectNonDemoPart } from '../../store/selectors';
import { getParts } from '../../store/partSlice';
import { selectNonDemoCameras } from '../../store/cameraSlice';
import { Status } from '../../store/project/projectTypes';

import { useInterval } from '../../hooks/useInterval';
import { Url } from '../../enums';

import LabelingPage from '../LabelingPage/LabelingPage';
import { CaptureDialog } from '../CaptureDialog';
import { Instruction } from '../Instruction';
import { FilteredImgList } from '../FilteredImgList';
import { EmptyAddIcon } from '../EmptyAddIcon';

const theme = getTheme();
const classes = mergeStyleSets({
  seperator: {
    margin: '20px 0px',
  },
});

/**
 * Use the factory to create selector here.
 * If we put them inside the component,
 * every time component rerender will return a different selector,
 * which loose the benefit of memoization.
 */
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
  const filteredItems = useMemo(() => Object.keys(filterItems).filter((e) => filterItems[e]), [filterItems]);

  return [items, filteredItems];
}

/**
 * Tell server that the user is checking the re-label images,
 * so it won't update the re-label images queue.
 * @param isAlive The condition if the re-label images is being checked
 */
const useKeepAlive = (isAlive) => {
  const nonDemoProjectId = useSelector((state: State) => state.trainingProject.nonDemo[0]);
  useInterval(
    () => {
      Axios.post(`/api/projects/${nonDemoProjectId}/relabel_keep_alive/`);
    },
    isAlive ? 3000 : null,
  );
};

export const Images: React.FC = () => {
  const [isCaptureDialgOpen, { setTrue: openCaptureDialog, setFalse: closeCaptureDialog }] = useBoolean(
    false,
  );
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const labeledImages = useSelector(labeledImagesSelector);
  const unlabeledImages = useSelector(unlabeledImagesSelector);
  // Re-labeled images stands for those images that is capture from the inference
  const relabelImages = useSelector(relabelImageSelector);
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
    [openCaptureDialog],
  );

  const [cameraItems, filteredCameras] = useFilterItems(selectNonDemoCameras);
  const [partItems, filteredParts] = useFilterItems(selectNonDemoPart);

  const commandBarFarItems: ICommandBarItemProps[] = useMemo(
    () => [
      {
        key: 'filter',
        iconOnly: true,
        // Make the icon solid if there is a filter applied
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
    [cameraItems, filteredCameras.length, filteredParts.length, partItems],
  );

  useEffect(() => {
    dispatch(getImages({ freezeRelabelImgs: true }));
    // We need part info for image list items
    dispatch(getParts());
  }, [dispatch]);

  useKeepAlive(relabelImages.length > 0);

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

  const onRenderUntaggedPivot = () => {
    if (unlabeledImages.length === 0 && relabelImages.length === 0)
      return (
        <EmptyAddIcon
          title="Looks like you don’t have any untagged images"
          subTitle="Continue adding and tagging more images from your video streams to improve your model"
          primary={{ text: 'Capture from camera', onClick: openCaptureDialog }}
          secondary={{ text: 'Upload images', onClick: onUpload }}
        />
      );

    return (
      <>
        {relabelImages.length > 0 && (
          <>
            <Separator alignContent="start" className={classes.seperator}>
              Deployment captures
            </Separator>
            <MessageBar styles={{ root: { margin: '12px 0px' } }}>
              Images saved from the current deployment. Confirm or modify the objects identified to improve
              your model.
            </MessageBar>
            <FilteredImgList
              images={relabelImages}
              filteredCameras={filteredCameras}
              filteredParts={filteredParts}
            />
          </>
        )}
        {unlabeledImages.length > 0 && (
          <>
            <Separator alignContent="start" className={classes.seperator}>
              Manually added
            </Separator>
            <FilteredImgList
              images={unlabeledImages}
              filteredCameras={filteredCameras}
              filteredParts={filteredParts}
            />
          </>
        )}
      </>
    );
  };

  const onRenderMain = () => {
    if (labeledImages.length + unlabeledImages.length)
      return (
        <Pivot>
          <PivotItem headerText="Untagged">
            {onRenderInstructionInsidePivot()}
            {onRenderUntaggedPivot()}
          </PivotItem>
          <PivotItem headerText="Tagged">
            {onRenderInstructionInsidePivot()}
            <FilteredImgList
              images={labeledImages}
              filteredCameras={filteredCameras}
              filteredParts={filteredParts}
            />
          </PivotItem>
        </Pivot>
      );

    return (
      <EmptyAddIcon
        title="Add images"
        subTitle="Capture images from your video streams and tag parts"
        primary={{ text: 'Capture from camera', onClick: openCaptureDialog }}
        secondary={{ text: 'Upload images', onClick: onUpload }}
      />
    );
  };

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
              button={{ text: 'Go to Home', to: Url.HOME_CUSTOMIZE }}
            />
          )}
          {relabelImgsReadyToTrain > 0 && (
            <Instruction
              title={`${relabelImgsReadyToTrain} images saved from the current deployment have been tagged!`}
              subtitle="Update the deployment to retrain the model"
              button={{
                text: 'Update model',
                to: Url.DEPLOYMENT,
              }}
            />
          )}
          <Breadcrumb items={[{ key: 'images', text: 'Images' }]} />
          {onRenderMain()}
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

import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  Separator,
  Stack,
  ICommandBarItemProps,
  Label,
  CommandBar,
  Toggle,
  ContextualMenuItemType,
  MessageBar,
} from '@fluentui/react';
import { useSelector, useDispatch } from 'react-redux';

import {
  imageItemSelectorFactory,
  relabelImageSelector,
  selectProjectPartsFactory,
} from '../../../store/selectors';
import { selectNonDemoCameras } from '../../../store/cameraSlice';
import { State } from 'RootStateType';
import { postImages } from '../../../store/imageSlice';

import { FilteredImgList } from '../../FilteredImgList';
import { CaptureDialog } from '../../CaptureDialog';
import LabelingPage from '../../LabelingPage/LabelingPage';

interface Props {
  modelId: number;
}

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
        onClick: () => {
          setFilterItems(onToggleFilterItem(c.id));
        },
      })),
    [itemsInStore, filterItems],
  );
  const filteredItems = useMemo(() => Object.keys(filterItems).filter((e) => filterItems[e]), [filterItems]);

  return [items, filteredItems];
}

const Images = (props: Props) => {
  const { modelId } = props;

  const labeledImages = useSelector(labeledImagesSelector);
  const unlabeledImages = useSelector(unlabeledImagesSelector);
  // Re-labeled images stands for those images that is capture from the inference
  const relabelImages = useSelector(relabelImageSelector);

  const [isCaptureDialogOpen, setIsCaptureDialogOpen] = useState(false);
  const [isTagged, setIsTagged] = useState(false);

  const [cameraItems, filteredCameras] = useFilterItems(selectNonDemoCameras);
  const [partItems, filteredParts] = useFilterItems(selectProjectPartsFactory(modelId));
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();

  const onUpload = useCallback(() => {
    fileInputRef.current.click();
  }, []);

  function onUploadFileInput(e: React.ChangeEvent<HTMLInputElement>): void {
    for (let i = 0; i < e.target.files.length; i++) {
      const formData = new FormData();
      formData.append('image', e.target.files[i]);
      formData.append('project', modelId.toString());
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
        onClick: () => setIsCaptureDialogOpen(true),
      },
    ],
    [onUpload],
  );

  const rightCommandItems: ICommandBarItemProps[] = [
    {
      key: 'filter',
      iconOnly: true,
      iconProps: { iconName: 'Filter' },
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
    {
      key: 'error',
      iconOnly: true,
      iconProps: { iconName: 'Error' },
    },
  ];

  const onCaptureDialogClose = useCallback(() => {
    setIsCaptureDialogOpen(false);
  }, []);

  const onLabelingPageClose = useCallback(() => {
    setIsCaptureDialogOpen(false);
  }, []);

  return (
    <>
      <Stack styles={{ root: { padding: '20px' } }}>
        <Label required>Images</Label>
        <Stack horizontal horizontalAlign="space-between">
          <CommandBar items={commandBarItems} styles={{ root: { padding: '0' } }} />
          <Stack horizontal>
            <Toggle
              label="Tagged"
              styles={{
                root: { display: 'flex', flexFlow: 'row-reverse', alignItems: 'center', marginBottom: 0 },
                label: { margin: '5px' },
              }}
              checked={isTagged}
              onChange={(_, checked) => setIsTagged(checked)}
            />
            <CommandBar items={rightCommandItems} />
          </Stack>
        </Stack>
        <Separator />
      </Stack>
      <Stack styles={{ root: { padding: '0 20px', height: 'calc(100vh - 558px)', overflowY: 'scroll' } }}>
        {isTagged ? (
          <>
            {relabelImages.length > 0 && (
              <>
                <MessageBar styles={{ root: { margin: '12px 0px' } }}>
                  Images saved from the current deployment. Confirm or modify the objects identified to
                  improve your model.
                </MessageBar>
                <FilteredImgList
                  images={relabelImages}
                  filteredCameras={filteredCameras}
                  filteredParts={filteredParts}
                />
              </>
            )}
            <FilteredImgList
              images={labeledImages}
              filteredCameras={filteredCameras}
              filteredParts={filteredParts}
            />
          </>
        ) : (
          <FilteredImgList
            images={unlabeledImages}
            filteredCameras={filteredCameras}
            filteredParts={filteredParts}
          />
        )}
      </Stack>
      <CaptureDialog isOpen={isCaptureDialogOpen} onDismiss={onCaptureDialogClose} projectId={modelId} />
      <LabelingPage onSaveAndGoCaptured={onLabelingPageClose} projectId={modelId} />
      <input
        ref={fileInputRef}
        type="file"
        onChange={onUploadFileInput}
        accept="image/*"
        multiple
        style={{ display: 'none' }}
      />
    </>
  );
};

export default Images;

import React, { useCallback, useMemo } from 'react';
import { FocusZone, List, IRectangle, mergeStyleSets } from '@fluentui/react';
import { useConstCallback } from '@uifabric/react-hooks';
import { useDispatch } from 'react-redux';
import * as R from 'ramda';

import { Image } from '../store/type';
import LabelDisplayImage from './LabelDisplayImage';
import { openLabelingPage } from '../store/labelingPageSlice';
import { timeStampConverter } from '../utils/timeStampConverter';

const ROWS_PER_PAGE = 3;
const MAX_ROW_HEIGHT = 300;
const classNames = mergeStyleSets({
  listGridExampleTile: {
    float: 'left',
    margin: '3px',
  },
});

export type Item = Pick<Image, 'id' | 'image' | 'timestamp' | 'isRelabel'> & {
  partName: string;
};

export const ImageList: React.FC<{ images: Item[] }> = ({ images }) => {
  const columnCount = React.useRef(0);
  const rowHeight = React.useRef(0);
  const dispatch = useDispatch();

  const sortedImages = useMemo(() => {
    const timeStampDiff = (a: Item, b: Item) => Date.parse(b.timestamp) - Date.parse(a.timestamp);
    return R.sort(timeStampDiff, images);
  }, [images]);

  const getItemCountForPage = useConstCallback((itemIndex: number, surfaceRect: IRectangle) => {
    if (itemIndex === 0) {
      columnCount.current = Math.ceil(surfaceRect.width / MAX_ROW_HEIGHT);
      rowHeight.current = Math.floor(surfaceRect.width / columnCount.current);
    }
    return columnCount.current * ROWS_PER_PAGE;
  });

  const onRenderCell = useCallback(
    (item: Item) => {
      return (
        <div
          key={item.id}
          className={classNames.listGridExampleTile}
          data-is-focusable
          style={{
            width: `${100 / columnCount.current}%`,
            height: MAX_ROW_HEIGHT,
          }}
        >
          <LabelDisplayImage
            imgId={item.id}
            imgUrl={item.image}
            imgTimeStamp={timeStampConverter(item.timestamp)}
            partName={item.partName}
            isRelabel={item.isRelabel}
            pointerCursor
            onClick={() =>
              dispatch(
                openLabelingPage({ selectedImageId: item.id, imageIds: sortedImages.map((e) => e.id) }),
              )
            }
          />
        </div>
      );
    },
    [dispatch, sortedImages],
  );

  const getPageHeight = useConstCallback((): number => {
    return rowHeight.current * ROWS_PER_PAGE;
  });

  return (
    <>
      <FocusZone>
        <List
          items={sortedImages}
          getItemCountForPage={getItemCountForPage}
          getPageHeight={getPageHeight}
          renderedWindowsAhead={4}
          onRenderCell={onRenderCell}
        />
      </FocusZone>
    </>
  );
};

import React from 'react';
import { FocusZone, List, IRectangle, mergeStyleSets } from '@fluentui/react';
import { useConstCallback } from '@uifabric/react-hooks';
import { useDispatch } from 'react-redux';

import { Image } from '../store/type';
import LabelDisplayImage from './LabelDisplayImage';
import LabelingPage, { LabelPageMode } from './LabelingPage/LabelingPage';
import { openLabelingPage } from '../store/labelingPageSlice';

const ROWS_PER_PAGE = 3;
const MAX_ROW_HEIGHT = 300;
const classNames = mergeStyleSets({
  listGridExampleTile: {
    float: 'left',
    margin: '3px',
  },
});

export const ImageList: React.FC<{ isRelabel: boolean; images: Image[] }> = ({ isRelabel, images }) => {
  const columnCount = React.useRef(0);
  const rowHeight = React.useRef(0);
  const dispatch = useDispatch();

  const getItemCountForPage = useConstCallback((itemIndex: number, surfaceRect: IRectangle) => {
    if (itemIndex === 0) {
      columnCount.current = Math.ceil(surfaceRect.width / MAX_ROW_HEIGHT);
      rowHeight.current = Math.floor(surfaceRect.width / columnCount.current);
    }
    return columnCount.current * ROWS_PER_PAGE;
  });

  const onRenderCell = useConstCallback((item: Image) => {
    return (
      <div
        className={classNames.listGridExampleTile}
        data-is-focusable
        style={{
          width: `${100 / columnCount.current}%`,
        }}
      >
        <LabelDisplayImage
          imgId={item.id}
          imgUrl={item.image}
          pointerCursor
          onClick={() =>
            dispatch(openLabelingPage({ selectedImageId: item.id, imageIds: images.map((e) => e.id) }))
          }
        />
      </div>
    );
  });

  const getPageHeight = useConstCallback((): number => {
    return rowHeight.current * ROWS_PER_PAGE;
  });

  return (
    <>
      <FocusZone>
        <List
          items={images}
          getItemCountForPage={getItemCountForPage}
          getPageHeight={getPageHeight}
          renderedWindowsAhead={4}
          onRenderCell={onRenderCell}
        />
      </FocusZone>
      <LabelingPage isRelabel={isRelabel} mode={LabelPageMode.MultiPage} />
    </>
  );
};

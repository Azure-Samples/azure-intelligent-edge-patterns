import React, { useEffect } from 'react';
import { FocusZone } from 'office-ui-fabric-react/lib/FocusZone';
import { List } from 'office-ui-fabric-react/lib/List';
import { IRectangle } from 'office-ui-fabric-react/lib/Utilities';
import { mergeStyleSets } from 'office-ui-fabric-react/lib/Styling';
import { useConstCallback } from '@uifabric/react-hooks';
import { Image } from '../store/type';
import { selectAllImages, getImages } from '../store/imageSlice';
import { useSelector, useDispatch } from 'react-redux';
import LabelDisplayImage from './LabelDisplayImage';
import LabelingPage from './LabelingPage/LabelingPage';
import { openLabelingPage } from '../store/labelingPageSlice';

const ROWS_PER_PAGE = 3;
const MAX_ROW_HEIGHT = 300;
const classNames = mergeStyleSets({
  listGridExampleTile: {
    float: 'left',
    margin: '3px',
  },
});

export const ImageList: React.FC<{ isRelabel: boolean }> = ({ isRelabel }) => {
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
          width: 100 / columnCount.current + '%',
        }}
      >
        <LabelDisplayImage
          imgId={item.id}
          imgUrl={item.image}
          pointerCursor
          onClick={() => dispatch(openLabelingPage({ selectedImageId: item.id, imageIds: [item.id] }))}
        />
      </div>
    );
  });

  const getPageHeight = useConstCallback((): number => {
    return rowHeight.current * ROWS_PER_PAGE;
  });

  const items = useSelector(selectAllImages);

  useEffect(() => {
    dispatch(getImages());
  }, [dispatch]);

  return (
    <>
      <FocusZone>
        <List
          items={items}
          getItemCountForPage={getItemCountForPage}
          getPageHeight={getPageHeight}
          renderedWindowsAhead={4}
          onRenderCell={onRenderCell}
        />
      </FocusZone>
      <LabelingPage isRelabel={isRelabel} />
    </>
  );
};

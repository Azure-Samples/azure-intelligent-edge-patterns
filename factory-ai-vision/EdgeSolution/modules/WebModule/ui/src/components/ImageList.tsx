import React, { useCallback, useMemo } from 'react';
import { mergeStyleSets } from '@fluentui/react';
import { useDispatch } from 'react-redux';
import * as R from 'ramda';

import { Image } from '../store/type';
import LabelDisplayImage from './LabelDisplayImage';
import { OpenFrom, openLabelingPage } from '../store/labelingPageSlice';
import { timeStampConverter } from '../utils/timeStampConverter';

const classNames = mergeStyleSets({
  listGridExampleTile: {
    display: 'inline-block',
    margin: '10px',
  },
});

export type Item = Pick<Image, 'id' | 'image' | 'timestamp' | 'manualChecked'> & {
  part: {
    id: number;
    name: string;
  };
  camera: {
    id: number;
    name: string;
  };
};

export const ImageList: React.FC<{ images: Item[] }> = ({ images }) => {
  const dispatch = useDispatch();

  const sortedImages = useMemo(() => {
    const timeStampDiff = (a: Item, b: Item) => Date.parse(b.timestamp) - Date.parse(a.timestamp);
    return R.sort(timeStampDiff, images);
  }, [images]);

  const onRenderCell = useCallback(
    (item: Item) => {
      return (
        <div key={item.id} className={classNames.listGridExampleTile}>
          <LabelDisplayImage
            imgId={item.id}
            imgUrl={item.image}
            imgTimeStamp={timeStampConverter(item.timestamp)}
            cameraName={item.camera.name}
            partName={item.part.name}
            manualChecked={item.manualChecked}
            pointerCursor
            onClick={() =>
              dispatch(
                openLabelingPage({
                  selectedImageId: item.id,
                  imageIds: sortedImages.map((e) => e.id),
                  openFrom: OpenFrom.DisplayImage,
                }),
              )
            }
          />
        </div>
      );
    },
    [dispatch, sortedImages],
  );

  return <>{sortedImages.map(onRenderCell)}</>;
};

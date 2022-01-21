import { MessageBar } from '@fluentui/react';
import React from 'react';
import { ImageList, Item } from './ImageList';

function filterImgs(imgs: Item[], filterCameras: string[], filterParts: string[]): Item[] {
  let filteredImgs = imgs;
  if (filterCameras.length)
    filteredImgs = filteredImgs.filter((img) => filterCameras.includes(img.camera.id?.toString()));
  if (filterParts.length) {
    filteredImgs = filteredImgs.filter((img) => {
      const imgParts = img.parts.map((img) => img.id);

      return imgParts.some((partId) => filterParts.indexOf(partId.toString()) >= 0);
    });
  }

  return filteredImgs;
}

type FilteredImgListProps = {
  images: Item[];
  filteredCameras: string[];
  filteredParts: string[];
};

export const FilteredImgList: React.FC<FilteredImgListProps> = ({
  images,
  filteredCameras,
  filteredParts,
}) => {
  const filteredImgs = filterImgs(images, filteredCameras, filteredParts);

  return (
    <div>
      {!filteredImgs.length && (
        <MessageBar styles={{ root: { margin: '5px 0px' } }}>
          There are no images that match your current filter
        </MessageBar>
      )}
      <ImageList images={filteredImgs} />
    </div>
  );
};

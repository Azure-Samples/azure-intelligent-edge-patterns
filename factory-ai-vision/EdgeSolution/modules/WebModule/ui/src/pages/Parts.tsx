import React, { useEffect } from 'react';
import { Flex, Image, Text } from '@fluentui/react-northstar';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { AddModuleDialog } from '../components/AddModuleDialog';
import { State } from '../store/State';
import { Part } from '../reducers/partReducer';
import { getImages, selectAllImages } from '../features/imageSlice';
import { getParts, postPart, selectAllParts } from '../features/partSlice';

const partsWithImgSelector = (state: State): (Part & { image: string })[] => {
  const parts = selectAllParts(state);
  const images = selectAllImages(state);
  return parts.map((p) => {
    const relatedImage = images.find((i) => i.part === p.id);
    return { ...p, image: relatedImage?.image || '' };
  });
};

export const Parts: React.FC = () => {
  const partsWithImg = useSelector<State, (Part & { image: string })[]>(partsWithImgSelector);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getParts(false));
    dispatch(getImages());
  }, [dispatch]);

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <Flex gap="gap.large" wrap>
        {partsWithImg.map((ele) => (
          <Item key={ele.id} src={ele.image} id={ele.id} name={ele.name} />
        ))}
      </Flex>
      <div style={{ position: 'absolute', right: '100px', bottom: '100px' }}>
        <AddModuleDialog
          header="Add Part"
          fields={[
            {
              placeholder: 'Part Name',
              key: 'name',
              type: 'input',
              required: true,
            },
            {
              placeholder: 'Description',
              key: 'description',
              type: 'textArea',
              required: false,
            },
          ]}
          onConfirm={({ name, description }): void => {
            dispatch(postPart({ name, description }));
          }}
        />
      </div>
    </div>
  );
};

const Item = ({ src, id, name }): JSX.Element => {
  return (
    <Flex column hAlign="center" gap="gap.large" as={Link} to={`/parts/detail/capturePhotos?partId=${id}`}>
      <div style={{ width: '250px', height: '250px' }}>
        <Image src={src} styles={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <Text size="larger">{name}</Text>
    </Flex>
  );
};

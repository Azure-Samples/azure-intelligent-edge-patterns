import React, { useEffect, useState } from 'react';
import { Flex, Image, Text, Button, AddIcon } from '@fluentui/react-northstar';
import { Link } from 'react-router-dom';
import Axios from 'axios';
import { getIdFromUrl } from '../util/GetIDFromUrl';

export const Parts: React.FC = () => {
  const [parts, setParts] = useState([]);

  useEffect(() => {
    const partsAPI = Axios.get('/api/parts/');
    const imagesAPI = Axios.get('/api/images/');

    Axios.all([partsAPI, imagesAPI])
      .then(
        Axios.spread((...responses) => {
          const { data: partsRes } = responses[0];
          const { data: images } = responses[1];
          setParts(
            partsRes.map((e) => ({
              ...e,
              images: images.find((img) => getIdFromUrl(img.part) === e.id)?.image,
            })),
          );
        }),
      )
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <Flex gap="gap.large" wrap>
        {parts
          .filter((e) => !e.is_demo)
          .map((ele) => (
            <Item key={ele.id} src={ele.images} id={ele.id} name={ele.name} />
          ))}
      </Flex>
      <Button
        primary
        fluid
        circular
        content={<AddIcon size="largest" circular />}
        style={{
          width: 100,
          height: 100,
          position: 'fixed',
          right: '100px',
          bottom: '100px',
        }}
        as={Link}
        to="/parts/detail"
      />
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

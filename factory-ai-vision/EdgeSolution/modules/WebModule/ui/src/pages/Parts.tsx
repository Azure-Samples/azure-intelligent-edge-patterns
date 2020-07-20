import React, { useEffect, useState } from 'react';
import { Flex, Image, Text } from '@fluentui/react-northstar';
import { Link } from 'react-router-dom';
import Axios from 'axios';
import { AddModuleDialog } from '../components/AddModuleDialog';

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
              images: images.find((img) => img.part === e.id)?.image,
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
            // TODO Migrate this to part action
            Axios({
              method: 'POST',
              url: `/api/parts/`,
              data: {
                name,
                description,
              },
            })
              .then(({ data }) => {
                setParts((prev) => prev.concat(data));
                return void 0;
              })
              .catch((e) => {
                if (e.response) {
                  throw new Error(e.response.data.log);
                } else if (e.request) {
                  throw new Error(e.request);
                } else {
                  throw e;
                }
              })
              .catch((err) => {
                alert(err);
              });
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

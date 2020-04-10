import React, { useEffect, useState } from 'react';
import { Flex, Image, Text, Button, Icon } from '@fluentui/react-northstar';
import { Link } from 'react-router-dom';

export const Parts: React.FC = () => {
  const [parts, setParts] = useState([]);

  useEffect(() => {
    fetch('/api/parts')
      .then((res) => res.json())
      .then((data) => {
        setParts(data.map((ele) => ({ ...ele, images: [] })));
        return void 0;
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <Flex gap="gap.large" wrap>
        {parts.map((ele) => (
          <Item key={ele.id} src={ele.images[0]} name={ele.name} />
        ))}
      </Flex>
      <Button
        primary
        fluid
        circular
        content={<Icon name="add" size="largest" circular />}
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

const Item = ({ src, name }): JSX.Element => {
  return (
    <Flex column hAlign="center" gap="gap.large" as={Link} to={`/parts/detail/${name}`}>
      <div style={{ width: '250px', height: '250px' }}>
        <Image src={src} styles={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <Text size="larger">{name}</Text>
    </Flex>
  );
};

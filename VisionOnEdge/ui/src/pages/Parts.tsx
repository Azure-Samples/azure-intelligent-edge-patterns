import React from 'react';
import { Flex, Image, Text, Button, Icon } from '@fluentui/react-northstar';
import { Link } from 'react-router-dom';

export const Parts: React.FC = () => {
  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <Flex gap="gap.large" wrap>
        <Item src="https://via.placeholder.com/150" name="Part 1" />
        <Item src="https://via.placeholder.com/150" name="Part 2" />
        <Item src="https://via.placeholder.com/150" name="Part 3" />
        <Item src="https://via.placeholder.com/150" name="Part 1" />
        <Item src="https://via.placeholder.com/150" name="Part 2" />
        <Item src="https://via.placeholder.com/150" name="Part 3" />
        <Item src="https://via.placeholder.com/150" name="Part 1" />
        <Item src="https://via.placeholder.com/150" name="Part 2" />
        <Item src="https://via.placeholder.com/150" name="Part 3" />
        <Item src="https://via.placeholder.com/150" name="Part 1" />
        <Item src="https://via.placeholder.com/150" name="Part 2" />
        <Item src="https://via.placeholder.com/150" name="Part 3" />
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
      />
    </div>
  );
};

const Item = ({ src, name }): JSX.Element => {
  return (
    <Flex column hAlign="center" gap="gap.large" as={Link} to={`/parts/${name}`}>
      <div style={{ width: '250px', height: '250px' }}>
        <Image src={src} styles={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <Text size="larger">{name}</Text>
    </Flex>
  );
};

import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { Text, Flex } from '@fluentui/react-northstar';

const table = {
  Home: '/',
  Camera: '/cameras',
  Part: '/parts',
  Location: '/location',
};

const BreadcrumbTitle: FC<{ title: string }> = ({ title }) => {
  const pathTitles = title.split('/');

  return (
    <Flex gap="gap.smaller">
      {pathTitles.map((e, i, arr) => {
        if (i === arr.length - 1)
          return (
            <Text key={i} styles={{ color: 'black', cursor: 'default' }}>
              {e}
            </Text>
          );
        return (
          <>
            <Link key={`link${i}`} to={table[e]}>
              <Text>{e}</Text>
            </Link>
            <Text key={`arrow${i}`} styles={{ color: 'black', cursor: 'default' }}>
              {'>'}
            </Text>
          </>
        );
      })}
    </Flex>
  );
};

export default BreadcrumbTitle;

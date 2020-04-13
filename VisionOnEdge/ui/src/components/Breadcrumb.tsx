import React, { FC } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Text, Flex } from '@fluentui/react-northstar';

const getTitle = (pathname): string => {
  if (!Number.isNaN(parseInt(pathname, 10))) {
    return 'Details';
  }

  switch (pathname) {
    case 'cameras':
      return 'Camera';
    case 'parts':
      return 'Part';
    case 'location':
      return 'Location';
    case 'register':
      return 'Register';
    case 'label':
      return 'Label';
    case 'partIdentification':
      return 'Job Configuration';
    default:
      return null;
  }
};

const Breadcrumb: FC = () => {
  const { pathname } = useLocation();

  if (pathname === '/') return <Text color="black">Home</Text>;

  const pathTitles = pathname.split('/');

  return (
    <Flex gap="gap.smaller">
      <Link to={'/'} style={{ color: '#0094d8', textDecoration: 'none' }}>
        <Text>Home</Text>
      </Link>
      {pathTitles.map((e, i, arr) => {
        const title = getTitle(e);

        if (i === arr.length - 1) {
          return (
            <Text key={i} color="black">
              {title}
            </Text>
          );
        }

        return (
          <>
            <Link key={`link${i}`} to={`/${e}`} style={{ color: '#0094d8', textDecoration: 'none' }}>
              <Text>{title}</Text>
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

export default Breadcrumb;

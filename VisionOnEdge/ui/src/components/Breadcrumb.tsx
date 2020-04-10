import React, { FC } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Text, Flex } from '@fluentui/react-northstar';

const getTitle = (pathname: string): string => {
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
    case 'manual':
      return 'Identify Manually'
    default:
      return null;
  }
};

const Breadcrumb: FC = () => {
  const { pathname } = useLocation();

  if (pathname === '/') return <Text color="black">Home</Text>;

  const pathTitles = pathname.split('/').slice(1);

  return (
    <Flex gap="gap.smaller">
      <Link to={'/'} style={{ color: '#0094d8', textDecoration: 'none' }}>
        <Text>Home</Text>
      </Link>
      {pathTitles.map((e, i, arr) => {
        const title = getTitle(e);

        return (
          <>
            <Text key={i} color="black">
              {'>'}
            </Text>
            {i === arr.length - 1 ? (
              <Text key={`title-${i}`} color="black">
                {title}
              </Text>
            ) : (
              <Link key={`title-${i}`} to={`/${e}`} style={{ color: '#0094d8', textDecoration: 'none' }}>
                <Text>{title}</Text>
              </Link>
            )}
          </>
        );
      })}
    </Flex>
  );
};

export default Breadcrumb;

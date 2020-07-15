import React, { FC, MouseEvent, Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Text, Flex } from '@fluentui/react-northstar';

const getTitle = (pathname: string): string => {
  switch (pathname) {
    case 'cameras':
      return 'Camera';
    case 'parts':
      return 'Part';
    case 'locations':
      return 'Location';
    case 'register':
      return 'Register';
    case 'label':
      return 'Label';
    case 'manual':
      return 'Identify Manually';
    case 'detail':
      return 'Details';
    case 'partIdentification':
      return 'Job Configuration';
    case 'pretrainDetection':
      return 'Demo Model';
    case 'capturePhotos':
      return null;
    case 'uploadPhotos':
      return null;
    default:
      if (typeof pathname === 'string') return 'Details';
      return null;
  }
};

const Breadcrumb: FC<{ disabled: boolean }> = ({ disabled }) => {
  const { pathname } = useLocation();

  if (pathname === '/') return <Text color="black">Home</Text>;

  const { pathTitles } = pathname
    .split('/')
    .slice(1)
    .reduce(
      (acc, cur) => {
        const title = getTitle(cur);
        if (!title) return acc;

        const path = `${acc.path}/${cur}`;

        return {
          pathTitles: [...acc.pathTitles, { title, to: path }],
          path,
        };
      },
      { pathTitles: [], path: '' },
    );

  return (
    <Flex gap="gap.smaller">
      <Link
        to={'/'}
        style={{ color: '#0094d8', textDecoration: 'none', cursor: disabled && 'default' }}
        onClick={(e: MouseEvent): void => {
          if (disabled) e.preventDefault();
        }}
      >
        <Text>Home</Text>
      </Link>
      {pathTitles.map((e, i, arr) => {
        return (
          <Fragment key={i}>
            <Text color="black">{'>'}</Text>
            {i === arr.length - 1 ? (
              <Text color="black">{e.title}</Text>
            ) : (
              <Link to={`${e.to}`} style={{ color: '#0094d8', textDecoration: 'none' }}>
                <Text>{e.title}</Text>
              </Link>
            )}
          </Fragment>
        );
      })}
    </Flex>
  );
};

export default Breadcrumb;

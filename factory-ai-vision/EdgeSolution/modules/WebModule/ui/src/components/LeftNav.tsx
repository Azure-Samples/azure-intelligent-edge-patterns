import { INavLinkGroup, Nav, INavLink } from '@fluentui/react';
import React, { useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { Url } from '../enums';

const navLinks: INavLink[] = [
  {
    name: 'Home',
    url: Url.HOME,
    iconProps: {
      imageProps: {
        src: '/icons/home.svg',
      },
    },
  },
  {
    name: 'Cameras',
    url: Url.CAMERAS,
    iconProps: {
      imageProps: {
        src: '/icons/cameras.svg',
      },
    },
  },
  {
    name: 'Images',
    url: Url.IMAGES,
    iconProps: {
      imageProps: {
        src: '/icons/images.svg',
      },
    },
  },
  // {
  //   name: 'Objects',
  //   url: Url.PARTS,
  //   iconProps: {
  //     imageProps: {
  //       src: '/icons/objects.svg',
  //     },
  //   },
  // },
  {
    name: 'Models',
    url: Url.MODELS,
    iconProps: {
      imageProps: {
        src: '/icons/models.svg',
      },
    },
  },
  {
    name: 'Cascades',
    url: Url.CASCADES,
    iconProps: {
      imageProps: {
        src: '/icons/models.svg',
      },
    },
  },
  {
    name: 'Deployment',
    url: Url.DEPLOYMENT,
    iconProps: {
      imageProps: {
        src: '/icons/deployment.svg',
      },
    },
  },
];

export const LeftNav: React.FC = () => {
  const history = useHistory();
  const location = useLocation();

  const navLinksGroup: INavLinkGroup[] = useMemo(() => {
    return [
      {
        links: navLinks.map((link) => ({
          ...link,
          // Set url to empty string to avoid default behaviour of redirecting
          url: '',
          // For selection
          key: link.url.replace('/', ''),
          onClick: () => {
            history.push(link.url);
          },
        })),
      },
    ];
  }, [history]);

  return (
    <div style={{ width: '206px', height: '100%', borderRight: '1px solid #eee' }}>
      <Nav groups={navLinksGroup} selectedKey={location.pathname.split('/')[1]} />
    </div>
  );
};

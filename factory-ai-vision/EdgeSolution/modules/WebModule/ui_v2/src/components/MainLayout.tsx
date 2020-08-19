import React from 'react';
import { Nav, INavLinkGroup, INavStyles } from '@fluentui/react';

const navLinksGroup: INavLinkGroup[] = [
  {
    links: [
      {
        name: 'Home',
        url: '/',
        iconProps: {
          imageProps: {
            src: '/icon/home.png',
          },
        },
      },
      {
        name: 'Cameras',
        url: '/cameras',
        iconProps: {
          imageProps: {
            src: '/icon/cameras.png',
          },
        },
      },
      {
        name: 'Images',
        url: '/images',
        iconProps: {
          imageProps: {
            src: '/icon/images.png',
          },
        },
      },
      {
        name: 'Parts',
        url: '/parts',
        iconProps: {
          imageProps: {
            src: '/icon/parts.png',
          },
        },
      },
    ],
  },
];

const navStyles: Partial<INavStyles> = {
  root: { width: '206px', borderRight: '1px solid #eee', height: '100vh' },
};

export const MainLayout: React.FC = () => {
  return <Nav groups={navLinksGroup} styles={navStyles} />;
};

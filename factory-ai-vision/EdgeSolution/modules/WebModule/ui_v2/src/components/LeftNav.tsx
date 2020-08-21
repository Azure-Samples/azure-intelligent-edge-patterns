import { INavLinkGroup, Nav } from '@fluentui/react';
import React from 'react';

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

export const LeftNav: React.FC = () => {
  return (
    <div style={{ width: '206px', height: '100%', borderRight: '1px solid #eee' }}>
      <Nav groups={navLinksGroup} />
    </div>
  );
};

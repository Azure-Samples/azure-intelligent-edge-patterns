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
            src: '/icons/home.png',
          },
        },
      },
      {
        name: 'Cameras',
        url: '/cameras',
        iconProps: {
          imageProps: {
            src: '/icons/cameras.png',
          },
        },
      },
      {
        name: 'Images',
        url: '/images',
        iconProps: {
          imageProps: {
            src: '/icons/images.png',
          },
        },
      },
      {
        name: 'Parts',
        url: '/parts',
        iconProps: {
          imageProps: {
            src: '/icons/parts.png',
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

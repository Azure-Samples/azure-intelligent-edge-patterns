import React from 'react';
import { Grid, Segment, Menu } from '@fluentui/react-northstar';
import { Link } from 'react-router-dom';

export const MainLayout: React.FC = ({ children }) => {
  return (
    <Grid
      columns="60px auto"
      rows="50px auto"
      design={{ height: '100vh' }}
      styles={{ justifyContent: 'stretch' }}
    >
      <Segment
        color="brand"
        content="Vision On Edge" // consider using Flex for the topnav
        inverted
        styles={{ gridColumn: '1 / span 2' }}
      />
      <Nav styles={{ gridColumn: '1 / span 1', gridRow: '2 / span 1' }} />
      <Segment styles={{ gridColumn: 'span 1' }}>{children}</Segment>
    </Grid>
  );
};

const Nav = ({ styles }): JSX.Element => {
  const items = [
    {
      key: 'cameras',
      as: Link,
      to: '/cameras',
      icon: 'call-video',
    },
    {
      key: 'parts',
      as: Link,
      to: '/parts',
      icon: 'settings',
    },
    {
      key: 'none',
      as: Link,
      to: '/',
      icon: 'user-friends',
    },
  ];

  return <Menu items={items} styles={styles} vertical pointing />;
};

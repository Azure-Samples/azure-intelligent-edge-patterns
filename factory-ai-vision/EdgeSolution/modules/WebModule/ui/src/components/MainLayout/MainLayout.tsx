import React, { FC } from 'react';
import { Grid, Segment, Image, Flex, Text, MenuIcon } from '@fluentui/react-northstar';
import { NavLink, Link } from 'react-router-dom';
import Breadcrumb from '../Breadcrumb';
import LeftNav from './LeftNav';

export const MainLayout: React.FC = ({ children }) => {
  return (
    <Grid
      columns="60px auto"
      rows="50px auto"
      design={{ height: '100vh' }}
      styles={{ justifyContent: 'stretch' }}
    >
      <TopNav />
      <LeftNav
        styles={{
          gridColumn: '1 / span 1',
          gridRow: '2 / span 1',
          boxShadow: '1px 0px 10px 0px rgba(0,0,0,0.75)',
          zIndex: 1,
        }}
      />

      <Segment styles={{ gridColumn: 'span 1', padding: '30px' }}>
        <Breadcrumb />
        {children}
      </Segment>
    </Grid>
  );
};

const TopNav: FC = () => {
  return (
    <Flex
      space="between"
      vAlign="center"
      padding="padding.medium"
      styles={{
        backgroundColor: '#0094d8',
        gridColumn: '1 / span 2',
        boxShadow: '0px 1px 10px 0px rgba(0,0,0,0.75)',
        zIndex: 2,
        fontSize: '20px',
        padding: '0.5em 1em',
      }}
    >
      <Flex gap="gap.large" vAlign="center">
        <MenuIcon size="large" styles={{ color: 'white' }} />
        <NavLink to={'/'} style={{ textDecoration: 'none' }}>
          <Text color="white">Vision on Edge</Text>
        </NavLink>
      </Flex>
      <Flex vAlign="center" hAlign="end" gap="gap.medium" styles={{ height: '100%' }}>
        <Link to="/setting" style={{ height: '100%' }}>
          <Image styles={{ height: '100%' }} src="/icons/setting.png" />
        </Link>
        <Text color="white">User</Text>
      </Flex>
    </Flex>
  );
};

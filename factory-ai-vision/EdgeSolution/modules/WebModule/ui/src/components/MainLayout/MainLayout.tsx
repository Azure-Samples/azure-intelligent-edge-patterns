import React, { FC, MouseEvent } from 'react';
import { Grid, Segment, Image, Flex, Text, BellIcon } from '@fluentui/react-northstar';
import { NavLink, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Breadcrumb from '../Breadcrumb';
import LeftNav from './LeftNav';
import { State } from '../../store/State';
import { Badge } from '../Badge';

export const MainLayout: FC = ({ children }) => {
  const isTrainerValid = useSelector<State, boolean>((state) => state.setting.isTrainerValid);

  return (
    <Grid
      columns="60px auto"
      rows="50px auto"
      design={{ height: '100vh' }}
      styles={{ justifyContent: 'stretch' }}
    >
      <TopNav disabled={!isTrainerValid} />
      <LeftNav
        styles={{
          gridColumn: '1 / span 1',
          gridRow: '2 / span 1',
          boxShadow: '1px 0px 10px 0px rgba(0,0,0,0.75)',
          zIndex: 1,
        }}
        disabled={!isTrainerValid}
      />

      <Segment styles={{ gridColumn: 'span 1', padding: '30px' }}>
        <Breadcrumb disabled={!isTrainerValid} />
        {children}
      </Segment>
    </Grid>
  );
};

const TopNav: FC<{ disabled: boolean }> = ({ disabled }) => {
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
        <NavLink
          to={'/'}
          style={{ textDecoration: 'none', cursor: disabled && 'default' }}
          onClick={(e: MouseEvent): void => {
            if (disabled) e.preventDefault();
          }}
        >
          <Flex gap="gap.medium">
            <Image src="/icons/Home_white.png" design={{ width: '30px' }} />
            <Text color="white">Vision on Edge</Text>
          </Flex>
        </NavLink>
      </Flex>
      <Flex
        vAlign="center"
        hAlign="end"
        gap="gap.medium"
        styles={{ height: '100%' }}
        onClick={(e: MouseEvent): void => {
          if (disabled) e.preventDefault();
        }}
      >
        <Badge count={0}>
          <BellIcon size="larger" />
        </Badge>
        <Link to="/setting" style={{ height: '100%', cursor: disabled && 'default' }}>
          <Image styles={{ height: '100%' }} src="/icons/setting.png" />
        </Link>
        <Text color="white">User</Text>
      </Flex>
    </Flex>
  );
};

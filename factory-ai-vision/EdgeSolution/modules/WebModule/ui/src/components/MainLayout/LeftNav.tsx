import React, { memo, FC } from 'react';
import { Segment, Image, Flex } from '@fluentui/react-northstar';
import { NavLink } from 'react-router-dom';

const LeftNav: FC<any> = ({ styles }): JSX.Element => {
  return (
    <Segment color="grey" inverted styles={{ ...styles, padding: 0, paddingTop: '1em' }}>
      <Flex column gap="gap.large" hAlign="center">
        <NavItem src="/icons/location.png" to="/locations"></NavItem>
        <NavItem src="/icons/camera.png" to="/cameras"></NavItem>
        <NavItem src="/icons/part.png" to="/parts"></NavItem>
        <NavItem src="/icons/manual.png" to="/manual"></NavItem>
        <NavItem src="/icons/partIdentification.png" to="/partIdentification"></NavItem>
      </Flex>
    </Segment>
  );
};

const NavItem = ({ src, to }): JSX.Element => {
  return (
    <NavLink
      to={to}
      style={{ display: 'flex', justifyContent: 'center', padding: '0.8em' }}
      activeStyle={{ backgroundColor: 'rgba(250, 83, 5, 0.5)' }}
    >
      <Image src={src} design={{ width: '100%' }}></Image>
    </NavLink>
  );
};

export default memo(LeftNav);

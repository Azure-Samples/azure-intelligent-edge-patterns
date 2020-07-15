import React, { memo, MouseEvent, FC } from 'react';
import { Segment, Image, Flex, Tooltip } from '@fluentui/react-northstar';
import { NavLink } from 'react-router-dom';
import { useProject } from '../../hooks/useProject';
import { useCameras } from '../../hooks/useCameras';

const LeftNav: FC<any> = ({ styles, disabled }): JSX.Element => {
  const project = useProject(false);
  const cameras = useCameras();
  const cameraInUsed = cameras.find((e) => e.id === project.data.camera);

  return (
    <Segment color="grey" inverted styles={{ ...styles, padding: 0, paddingTop: '1em' }}>
      <Flex column gap="gap.large" hAlign="center">
        <NavItem title="Location" disabled={disabled} src="/icons/location.png" to="/locations"></NavItem>
        <NavItem
          title="Camera"
          disabled={disabled}
          src="/icons/camera.png"
          to={cameraInUsed ? `/cameras/detail?name=${cameraInUsed.name}` : '/cameras'}
        />
        <NavItem title="Part" disabled={disabled} src="/icons/part.png" to="/parts"></NavItem>
        <NavItem
          title="Part Identification"
          disabled={disabled}
          src="/icons/partIdentification.png"
          to="/partIdentification"
        ></NavItem>
        <NavItem
          title="Manual Identification"
          disabled={disabled}
          src="/icons/manual.png"
          to="/manual"
        ></NavItem>
        <NavItem
          title="Demo Model"
          disabled={disabled}
          src="/icons/pretrained-model.png"
          to="/pretrainDetection"
        ></NavItem>
      </Flex>
    </Segment>
  );
};

interface NavItemProps {
  title: string;
  src: string;
  to: string;
  disabled: boolean;
}
const NavItem: FC<NavItemProps> = ({ title, src, to, disabled }): JSX.Element => {
  return (
    <Tooltip
      content={title}
      position="after"
      trigger={
        <NavLink
          to={to}
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '0.8em',
            cursor: disabled && 'default',
          }}
          activeStyle={{ backgroundColor: 'rgba(250, 83, 5, 0.5)' }}
          onClick={(e: MouseEvent): void => {
            if (disabled) e.preventDefault();
          }}
        >
          <Image src={src} design={{ width: '100%' }} />
        </NavLink>
      }
    />
  );
};

export default memo(LeftNav);

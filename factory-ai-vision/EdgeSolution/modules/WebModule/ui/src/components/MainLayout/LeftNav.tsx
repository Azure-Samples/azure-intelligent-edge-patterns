import React, { memo, MouseEvent, FC } from 'react';
import { Segment, Image, Flex, Box, mergeStyles, Text } from '@fluentui/react-northstar';
import { NavLink } from 'react-router-dom';
import FeedbackDialog from '../FeedbackDialog';

const itemStyles = (disabled): React.CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '0.8em',
  cursor: disabled && 'default',
  width: '100%',
  textDecoration: 'none',
});

const LeftNav: FC<any> = ({ styles, disabled, width }): JSX.Element => {
  return (
    <Segment color="grey" inverted styles={{ ...styles, padding: 0, paddingTop: '1em' }}>
      <Flex column gap="gap.large" hAlign="center" styles={{ height: '100%' }}>
        <NavItem
          title="Location"
          disabled={disabled}
          src="/icons/location.png"
          to="/locations"
          width={width}
        ></NavItem>
        <NavItem title="Camera" disabled={disabled} src="/icons/camera.png" to="/cameras" width={width} />
        <NavItem title="Part" disabled={disabled} src="/icons/part.png" to="/parts" width={width}></NavItem>
        <NavItem
          title="Part Identification"
          disabled={disabled}
          src="/icons/partIdentification.png"
          to="/partIdentification"
          width={width}
        ></NavItem>
        <NavItem
          title="Manual Identification"
          disabled={disabled}
          src="/icons/manual.png"
          to="/manual"
          width={width}
        ></NavItem>
        <NavItem
          title="Demo Model"
          disabled={disabled}
          src="/icons/pretrained-model.png"
          to="/pretrainDetection"
          width={width}
        ></NavItem>
        <FeedbackDialog
          trigger={
            <Box
              styles={mergeStyles(itemStyles(disabled), {
                ':hover': { cursor: 'pointer' },
                marginTop: 'auto',
                marginBottom: '20px',
              })()}
              onClick={(e: MouseEvent): void => {
                if (disabled) e.preventDefault();
              }}
            >
              <Image src="/icons/feedback.png" design={{ width: `${width}px` }} />
              <Text color="white" content="Feedback" align="center" size="small" />
            </Box>
          }
        />
      </Flex>
    </Segment>
  );
};

interface NavItemProps {
  title: string;
  src: string;
  to: string;
  disabled: boolean;
  width: number;
}
const NavItem: FC<NavItemProps> = ({ title, src, to, disabled, width }): JSX.Element => {
  return (
    <NavLink
      to={to}
      style={itemStyles(disabled)}
      activeStyle={{ backgroundColor: 'rgba(250, 83, 5, 0.5)' }}
      onClick={(e: MouseEvent): void => {
        if (disabled) e.preventDefault();
      }}
    >
      <Image src={src} styles={{ width: `${width}px` }} />
      <Text color="white" content={title} align="center" size="small" />
    </NavLink>
  );
};

export default memo(LeftNav);

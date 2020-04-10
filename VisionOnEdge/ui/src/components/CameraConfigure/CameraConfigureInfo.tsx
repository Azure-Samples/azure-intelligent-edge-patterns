import React, { useState } from 'react';
import { Flex, Text, Status, Button, Icon } from '@fluentui/react-northstar';
import { Link } from 'react-router-dom';

export const CameraConfigureInfo: React.FC = () => {
  const [configureInfo, setConfigureInfo] = useState({
    successRate: 95,
    successfulInferences: 300,
    unIdetifiedItems: 15,
  });

  const onDeleteConfigure = (): void => {
    // TODO
  };

  return (
    <Flex column gap="gap.large">
      <h1>Configuration</h1>
      <ListItem
        title="Status"
        content={
          <Flex gap="gap.smaller" vAlign="center">
            <Status state="success" />
            <Text styles={{ margin: '5px' }} size="large">
              Online
            </Text>
          </Flex>
        }
      />
      <ListItem title="Configured for" content="Part Identification" />
      <Flex column gap="gap.small">
        <Text styles={{ width: '150px' }} size="large">
          Live View:
        </Text>
        <Flex
          styles={{
            width: '80%',
            height: '400px',
            backgroundColor: 'rgb(188, 188, 188)',
          }}
          vAlign="center"
          hAlign="center"
        >
          <Icon name="play" circular bordered size="largest" />
        </Flex>
      </Flex>
      <ListItem
        title="Success Rate"
        content={
          <Text styles={{ color: 'rgb(244, 152, 40)', fontWeight: 'bold' }} size="large">
            {`${configureInfo.successRate}%`}
          </Text>
        }
      />
      <ListItem title="Successful Inferences" content={configureInfo.successfulInferences} />
      <ListItem
        title="Unidentified Items"
        content={
          <>
            <Text styles={{ margin: '5px' }} size="large">
              {configureInfo.unIdetifiedItems}
            </Text>
            <Button
              content="Identify Manually"
              primary
              styles={{
                backgroundColor: 'red',
                marginLeft: '100px',
                ':hover': {
                  backgroundColor: '#A72037',
                },
                ':active': {
                  backgroundColor: '#8E192E',
                },
              }}
              as={Link}
              to="/"
            />
          </>
        }
      />
      <Button primary onClick={onDeleteConfigure}>
        Delete Configuration
      </Button>
    </Flex>
  );
};

const ListItem = ({ title, content }): JSX.Element => {
  const getContent = (): JSX.Element => {
    if (typeof content === 'string' || typeof content === 'number')
      return <Text size="large">{content}</Text>;
    return content;
  };

  return (
    <Flex vAlign="center">
      <Text styles={{ width: '200px' }} size="large">{`${title}: `}</Text>
      {getContent()}
    </Flex>
  );
};

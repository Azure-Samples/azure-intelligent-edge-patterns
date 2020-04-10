import React, { useState } from 'react';
import { Flex, Text, Status, Button, Image } from '@fluentui/react-northstar';
import { Link } from 'react-router-dom';

export const CameraConfigureInfo: React.FC = () => {
  const [configureInfo, setConfigureInfo] = useState({
    status: 'online',
    parts: ['part1', 'part2'],
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
      <ListItem title="Status" content={<CameraStatus online={configureInfo.status === 'online'} />} />
      <ListItem title="Configured for" content={configureInfo.parts.join(', ')} />
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
          <Image src="/icons/Play.png" styles={{ ':hover': { cursor: 'pointer' } }} />
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

const CameraStatus = ({ online }): JSX.Element => {
  const text = online ? 'Online' : 'Offline';
  const state = online ? 'success' : 'unknown';

  return (
    <Flex gap="gap.smaller" vAlign="center">
      <Status state={state} />
      <Text styles={{ margin: '5px' }} size="large">
        {text}
      </Text>
    </Flex>
  );
};

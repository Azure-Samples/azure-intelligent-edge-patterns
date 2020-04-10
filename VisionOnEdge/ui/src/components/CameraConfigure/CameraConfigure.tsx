import React from 'react';
import { Flex, Text, Status, Button, Icon } from '@fluentui/react-northstar';

export const CameraConfigure: React.FC = () => {
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
          <Text color="orange" size="large">
            95%
          </Text>
        }
      />
      <ListItem title="Successful Inferences" content="300" />
      <ListItem
        title="Unidentified Items"
        content={
          <>
            <Text styles={{ margin: '5px' }} size="large">
              15
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
            />
          </>
        }
      />
      <Button primary>Delete Configuration</Button>
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

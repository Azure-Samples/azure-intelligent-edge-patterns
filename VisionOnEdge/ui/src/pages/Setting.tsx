import React, { useState, useEffect } from 'react';
import { Divider, Flex, Text, Input, Button } from '@fluentui/react-northstar';
import { Link } from 'react-router-dom';

export const Setting = (): JSX.Element => {
  const [confidence, setConfidence] = useState(0);
  const [namespace, setNamespace] = useState('');
  const [key, setKey] = useState('');
  const [projectData, setProjectData] = useState(null);
  const projectId = projectData?.id || null;

  useEffect(() => {
    fetch('/api/projects/')
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) {
          setProjectData(data[0]);
          setNamespace(data[0]?.endpoint);
          setKey(data[0]?.training_key);
        }
        return void 0;
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const onSave = (): void => {
    const isProjectEmpty = projectId === null;
    const url = isProjectEmpty ? `/api/projects/` : `/api/projects/${projectId}/`;

    fetch(url, {
      body: JSON.stringify({
        ...projectData,
        training_key: key,
        endpoint: namespace,
      }),
      method: isProjectEmpty ? 'POST' : 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(() => {
        console.log('success');
        return void 0;
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <Flex column gap="gap.large">
      <h1>Setting</h1>
      <Divider color="grey" />
      <Flex vAlign="center">
        <Text size="large" design={{ width: '300px' }}>
          Identification Confidence%:
        </Text>
        <Input
          type="number"
          value={confidence}
          onChange={(_, { value }): void => setConfidence(parseInt(value, 10))}
        />
      </Flex>
      <Text size="large" weight="bold">
        Azure Cognitive Services Settings:{' '}
      </Text>
      <Flex vAlign="center">
        <Text size="large" design={{ width: '300px' }}>
          Namespace:
        </Text>
        <Input value={namespace} onChange={(_, { value }): void => setNamespace(value)} />
      </Flex>
      <Flex vAlign="center">
        <Text size="large" design={{ width: '300px' }}>
          Key:
        </Text>
        <Input value={key} onChange={(_, { value }): void => setKey(value)} />
      </Flex>
      <Flex gap="gap.large">
        <Button primary onClick={onSave}>
          Save
        </Button>
        <Button primary as={Link} to="/">
          Cancel
        </Button>
      </Flex>
    </Flex>
  );
};

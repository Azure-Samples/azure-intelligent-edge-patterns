import React, { useState, useEffect } from 'react';
import { Divider, Flex, Text, Input, Button, Alert } from '@fluentui/react-northstar';
import { Link } from 'react-router-dom';
import Axios from 'axios';

export const Setting = (): JSX.Element => {
  const [settingData, setSettingData] = useState({
    id: null,
    key: '',
    namespace: '',
    iotHubConnectionString: '',
    deviceId: '',
    moduleId: '',
  });
  const [saveStatus, setSaveStatus] = useState({
    success: false,
    content: '',
  });

  useEffect(() => {
    Axios.get('/api/settings/')
      .then(({ data }) => {
        if (data.length > 0) {
          setSettingData({
            id: data[0].id,
            key: data[0].training_key,
            namespace: data[0].endpoint,
            iotHubConnectionString: data[0].iot_hub_connection_string,
            deviceId: data[0].device_id,
            moduleId: data[0].module_id,
          });
        }
        return void 0;
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const onSave = (): void => {
    const isSettingEmpty = settingData.id === null;
    const url = isSettingEmpty ? `/api/settings/` : `/api/settings/${settingData.id}/`;

    Axios(url, {
      data: {
        training_key: settingData.key,
        endpoint: settingData.namespace,
        iot_hub_connection_string: settingData.iotHubConnectionString,
        device_id: settingData.deviceId,
        module_id: settingData.moduleId,
      },
      method: isSettingEmpty ? 'POST' : 'PUT',
    })
      .then(() => {
        setSaveStatus({ success: true, content: 'Save Setting Successfully' });
        return void 0;
      })
      .catch((err) => {
        setSaveStatus({ success: false, content: `Fail to save settings: /n ${err.toString()}` });
      });
  };

  return (
    <Flex column gap="gap.large">
      <h1>Setting</h1>
      <Divider color="grey" />
      <Text size="large" weight="bold">
        Azure Cognitive Services Settings:{' '}
      </Text>
      <Flex vAlign="center">
        <Text size="large" design={{ width: '300px' }}>
          Namespace:
        </Text>
        <Input
          value={settingData.namespace}
          onChange={(_, { value }): void => setSettingData((prev) => ({ ...prev, namespace: value }))}
        />
      </Flex>
      <Flex vAlign="center">
        <Text size="large" design={{ width: '300px' }}>
          Key:
        </Text>
        <Input
          value={settingData.key}
          onChange={(_, { value }): void => setSettingData((prev) => ({ ...prev, key: value }))}
        />
      </Flex>
      <Flex vAlign="center">
        <Text size="large" design={{ width: '300px' }}>
          Iot Hub Connection String:
        </Text>
        <Input
          value={settingData.iotHubConnectionString}
          onChange={(_, { value }): void =>
            setSettingData((prev) => ({ ...prev, iotHubConnectionString: value }))
          }
        />
      </Flex>
      <Flex vAlign="center">
        <Text size="large" design={{ width: '300px' }}>
          Device ID:
        </Text>
        <Input
          value={settingData.deviceId}
          onChange={(_, { value }): void => setSettingData((prev) => ({ ...prev, deviceId: value }))}
        />
      </Flex>
      <Flex vAlign="center">
        <Text size="large" design={{ width: '300px' }}>
          Module ID:
        </Text>
        <Input
          value={settingData.moduleId}
          onChange={(_, { value }): void => setSettingData((prev) => ({ ...prev, moduleId: value }))}
        />
      </Flex>
      <Flex gap="gap.large">
        <Button primary onClick={onSave} disabled={Object.values(settingData).some((e) => !e)}>
          Save
        </Button>
        <Button primary as={Link} to="/">
          Cancel
        </Button>
      </Flex>
      {saveStatus.content ? (
        <Alert
          success={saveStatus.success}
          danger={!saveStatus.success}
          content={saveStatus.content}
          dismissible
        />
      ) : null}
    </Flex>
  );
};

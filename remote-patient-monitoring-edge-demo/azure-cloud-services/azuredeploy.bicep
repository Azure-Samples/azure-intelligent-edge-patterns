param param_serviceBus_name string {
  metadata: {
    description: 'This is the name of the Service Bus. This name is globally unique. Choose something specific.'
  }
}

param param_iotHub_name string {
  metadata: {
    description: 'This is the name of the IoT Hub. This name is globally unique. Choose something specific.'
  }
}

param param_acr_name string {
  metadata: {
    description: 'This is the name of the Azure Containter Registery. This name is globally unique. Choose something specific. The name can only container letters and numbers. No special charactars.'
  }
}

var _serviceBus_topic_name = 'iot-hub-messages'
var _authorizationRules_name = 'authorization-rule'
var _messages_route_name = 'all-messages'

resource serviceBus_namespace 'Microsoft.serviceBus/namespaces@2018-01-01-preview' = {
  name: param_serviceBus_name
  location: resourceGroup().location
  sku: {
    name: 'Premium'
    capacity: 1
  }
  properties: {
    zoneRedundant: true
  }
}

resource serviceBus_authorizationRules 'Microsoft.serviceBus/namespaces/AuthorizationRules@2017-04-01' = {
  name: '${serviceBus_namespace.name}/RootManageSharedAccessKey'
  properties: {
    rights: [
      'Listen'
      'Manage'
      'Send'
    ]
  }
}

resource serviceBus_namespace_networkRuleSet 'Microsoft.serviceBus/namespaces/networkRuleSets@2018-01-01-preview' = {
  name: '${serviceBus_namespace.name}/default'
  properties: {
    defaultAction: 'Deny'
    virtualNetworkRules: []
    ipRules: []
  }
}

resource serviceBus_namespace_topic 'Microsoft.serviceBus/namespaces/topics@2018-01-01-preview' = {
  name: '${serviceBus_namespace.name}/${_serviceBus_topic_name}'
  properties: {
    defaultMessageTimeToLive: 'P1D'
    maxSizeInMegabytes: 1024
    requiresDuplicateDetection: false
    duplicateDetectionHistoryTimeWindow: 'PT10M'
    enableBatchedOperations: true
    status: 'Active'
    supportOrdering: true
    autoDeleteOnIdle: 'P10675199DT2H48M5.4775807S'
    enablePartitioning: false
    enableExpress: false
  }
}

resource serviceBus_namespace_topic_authorizationRules 'Microsoft.serviceBus/namespaces/topics/authorizationRules@2018-01-01-preview' = {
  name: '${serviceBus_namespace_topic.name}/${_authorizationRules_name}'
  properties: {
    rights: [
      'Send'
    ]
  }
}

resource serviceBus_namespace_topic_subcriptions 'Microsoft.serviceBus/namespaces/topics/subscriptions@2018-01-01-preview' = {
  name: '${serviceBus_namespace_topic.name}/all-data-sub'
  properties: {
    lockDuration: 'PT30S'
    requiresSession: false
    defaultMessageTimeToLive: 'P14D'
    deadLetteringOnMessageExpiration: false
    deadLetteringOnFilterEvaluationExceptions: false
    maxDeliveryCount: 2000
    status: 'Active'
    enableBatchedOperations: true
    autoDeleteOnIdle: 'P14D'
  }
}

resource iotHub_resource 'Microsoft.Devices/IotHubs@2020-08-01' = {
  name: param_iotHub_name
  location: resourceGroup().location
  sku: {
    name: 'S1'
    capacity: 1
  }
  properties: {
    ipFilterRules: []
    eventHubEndpoints: {
      events: {
        retentionTimeInDays: 1
        partitionCount: 4
      }
    }
    routing: {
      endpoints: {
        serviceBusQueues: []
        serviceBusTopics: [
          {
            connectionString: listKeys(serviceBus_namespace_topic_authorizationRules.id, '2018-01-01-preview').primaryConnectionString
            name: _messages_route_name
          }
        ]
        eventHubs: []
        storageContainers: []
      }
      routes: [
        {
          name: _messages_route_name
          source: 'DeviceMessages'
          condition: 'true'
          endpointNames: [
            _messages_route_name
          ]
          isEnabled: true
        }
      ]
      fallbackRoute: {
        name: '$fallback'
        source: 'DeviceMessages'
        condition: 'true'
        endpointNames: [
          'events'
        ]
        isEnabled: true
      }
    }
    messagingEndpoints: {
      fileNotifications: {
        lockDurationAsIso8601: 'PT1M'
        ttlAsIso8601: 'PT1H'
        maxDeliveryCount: 10
      }
    }
    enableFileUploadNotifications: false
    cloudToDevice: {
      maxDeliveryCount: 10
      defaultTtlAsIso8601: 'PT1H'
      feedback: {
        lockDurationAsIso8601: 'PT1M'
        ttlAsIso8601: 'PT1H'
        maxDeliveryCount: 10
      }
    }
    features: 'None'
  }
}

resource acr 'Microsoft.ContainerRegistry/registries@2020-11-01-preview' = {
  name: param_acr_name
  location: resourceGroup().location
  sku: {
    name: 'Premium'
  }
}

output servicebus_connectionstring string = listkeys(serviceBus_authorizationRules.id,serviceBus_authorizationRules.apiVersion).primaryConnectionString

output iothub_object object = iotHub_resource

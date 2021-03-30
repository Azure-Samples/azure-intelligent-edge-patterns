# Subscriber

The subscriber is a Node Express application that subscribes to a topic on Azure Service Bus and writes the data to a FHIR server when events are received.

## Setup steps

If you are not using the fully automated setup, you'll need to manually set your Service Bus connection string.

1. Get your Azure Service Bus Connection String
  - You need to get your custom connection string for your Azure Service Bus you created in the previous step and copy to a file in this director.
  - You can get your connection string with this command, assuming you are using all the same defaults from the included ARM templates 
    ```
    az deployment group show --resource-group <your resource group> --name azuredeploy --query properties.outputs.servicebus_connectionstring.value --output tsv
    ```
  - **Or** you can get the connection string through the web portal following this documentation: https://docs.microsoft.com/en-us/azure/service-bus-messaging/service-bus-quickstart-portal#get-the-connection-string
  - Copy this string. You'll need it in the Helm deployment.

2. You can now proceed to the next step in the [main readme](../README.md)

## Data Prerequisites for Deployment

- **Azure Service Bus Connection String**
  - The subscriber's only role is to listen for data updates on the Azure Service Bus and post the data sent to the FHIR server. The connection string details that connection to the Azure Service Bus and should be configured via Helm.
  
- **FHIR URL**
  - The subscriber POSTs data to FHIR directly using the payload provided in the event. The FHIR URL should be set by Helm. No action needed assuming you are using all the default names.

## Deploy via Helm

The **recommended** approach is to deploy all containers at once with the Helm chart in the parent directory. (see [README](./../README.md#get-started))

But, if you want to deploy this single container you can do so by setting the empty values in [`values.helm`](./helm/values.yaml) and then running

_NOTE: This approach will not work if you previously deployed with the parent chart. Running this command creates a new release, but cannot be used to modify an existing release._

``` bash
helm upgrade --install subscriber helm
```
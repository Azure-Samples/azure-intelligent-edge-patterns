# Subscriber

The subscriber is a Node Express application that subscribes to a topic on Azure Service Bus and writes the data to a FHIR server when events are received.

## Setup steps

If you are not using the fully automated setup, you'll need to manually set your Service Bus connection string.

1. Get your Azure Service Bus Connection String
  - You need to get your custom connection string for your Azure Service Bus you created in the previous step and copy to a file in this director.
  - You can get your connection string with this command, assuming you are using all the same defaults from the included ARM templates 
    ```
    az servicebus topic authorization-rule keys list --resource-group <your resource group name> --namespace-name <your service bus name> --topic-name iot-hub-messages --name authorization-rule --query primaryConnectionString -o tsv
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

The **recomended** approach is to deploy all containers at once with the Helm chart in the parent directory.

But, if you want to deploy this single container you can do so with the following command. 

``` bash
helm upgrade --install subscriber helm --set acr_name=<your acr name>
```

# TODOs

![REMOVE ME](https://freedom1coffee.com/wp-content/uploads/2018/08/remove-before-flight.png)

_**[Remove this section before release]**_

- ~~Remove connection string and FHIR url defaults from dockerfile~~
- ~~get fhir service name programmatically? right now it is set in values.yaml~~
- get connection string programmatically? and/or pass to helm with --set? right now it is set in values.yaml
  - could add an output to the arm template and instruct the user to just copy it for later use 
  - https://docs.microsoft.com/en-us/azure/azure-resource-manager/templates/template-outputs

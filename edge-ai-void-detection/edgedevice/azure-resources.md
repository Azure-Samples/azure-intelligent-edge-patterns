# Azure Resources



## Create an IoT Hub
Use one of these [methods](https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-create-through-portal) to create an IoT hub.  It's recommended that you keep all resources for this walk-through in the same Resource Group but it's not required.  Use the default settings in the hub creation.


### Add a Consumer Group to your IoT hub
1.  See this [link](https://docs.microsoft.com/en-us/azure/time-series-insights/time-series-insights-how-to-add-an-event-source-iothub#add-a-consumer-group-to-your-iot-hub) for more details
1.  Open the newly deployed IoT hub in the Azure Portal
1.  Under **Settings** select **Built-in endpoints**
1.  Under **Events**, **Consumer Groups**, create a new consumer group, you'll use this consumer group again later when creating the TSI instance


## Create a Time Series Insights environment

Use these instructions to create a [Time Series Insights environment](https://docs.microsoft.com/en-us/azure/time-series-insights/time-series-insights-get-started) in the Azure portal in the same Resource Group you have been using

1.  On the Event Source Tab :
    * Give the event source a **Name**
    * Set **Source type** to `IoT Hub`
    * Set **Select a hub** to `Select Existing`
    * Set **Subscription** to your subscription
    * Set **IoT Hub Name** to the hub you created earlier
    * Set **Iot Hub access** policy to `service`
1.  In the **CONSUMER GROUP** section, great a new group for the the **IoT Hub consumer group**
1.  Set the **TIMESTAMP** property name to `iothub-creation-time-utc`
1.  Create the resource


## Create an Azure Storage Account and a Shared Access Signature (SAS) token

1. Login to https://portal.azure.com with the same account you used to setup the Time Series Insights Environment
1. Create a new storage account, recommended that you create the storage in the same Resource Group as your TSI instance but this is not required
    * Account kind : Storage (general purpose v1)
    * Replication : Locally-redundant storage (LRS)
1. Select the Storage Account
1. Under **Blob Service**, select **Containers**
1. Create a new Container called **still-images**, set **Public access level** to **Private**
1. Under **Settings** select **Shared Access signature**
1. Change the **End** date to a future date and click **Generate SAS and connection string**
1. From the results, save the Connection String value, you will use it later.
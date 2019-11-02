# Azure Resources

**NOTE** When creating resources, the Basic pricing tier will suffice for this tutorial


## Create an Event Hub
Follow this [Quickstart](https://docs.microsoft.com/en-us/azure/event-hubs/event-hubs-create) to setup an event hub and namespace

After creating the event hub and namespace, open the event hub namespace
1.  Under **Entities**, click **Event Hubs**
1.  Create a new Event Hub called actions-eventhub (or similar)
1.  In the new event hub, under **Settings** click **Shared access policies**
1.  Create a new policy called actionroutes-action-eventhub (or similar), enable **Send** and **Listen**


## Create an IoT Hub
Use one of these [methods](https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-create-through-portal) to create an IoT hub in the same Resource Group that contains the Event Hub

### Add Message Routing

#### Create a custom endpoint
1.  Open the newly deployed IoT hub in the Azure Portal
1.  Under **Messaging**, select **Message routing**
1.  Select the **Custom endpoints** tab
1.  Click Add, then Event hubs
    * Set **Endpoint name** to `DeviceNotifications`
    * Set the **Event hub namespace** to the event hub namespace created in the previous section
    * Set the **Event hub instance** to event hub created in the previous section

#### Add routes
1.  Still in **Message routing**, click the **Routes tab**
1.  Click **Add**
1.  Set the route **Name** to `TwinRoute`
1.  Set the **Endpoint** to `Device Notifications`
1.  Set the **Data source** to `Device Twin Change Events`
1.  Save
1.  Repeat with the following values :
    * **Name** to `LifecycleRoute`
    * **Endpoint** to `Device Notifications`
    * **Data source** to `Device Lifecycle Events`

## Create a Time Series Insights environment

Use these instructions to create a [Time Series Insights environment](https://docs.microsoft.com/en-us/azure/time-series-insights/time-series-insights-get-started) in the Azure portal in the same Resource Group you have been using

1.  On the Event Source Tab :
    * Give the event source a **Name**
    * Set **Source type** to `IoT Hub`
    * Set **Select a hub** to `Select Existing`
    * Set **Subscription** to your subscription
    * Set **IoT Hub Name** to the hub you created earlier
    * Set **Iot Hub access** policy to `service`
1.  Set the **IoT Hub consumer group** to `$Default`
1.  Set the **TIMESTAMP** property name to `iothub-creation-time-utc`
1.  Create the resource


## Create an Azure Storage Account and a Shared Access Signature (SAS) token

1. Login to https://portal.azure.com with the same account you used to setup the Time Series Insights Environment
1. Create a new storage account, recommended that you create the storage in the same Resource Group as your TSI instance but this is not required
1. Select the Storage Account
1. Under **Blob Service**, select **Containers**
1. Create a new Container called **still-images**, set **Public access level** to **Private**
1. Under **Settings** select **Shared Access signature**
1. Change the **End** date to a future date and click **Generate SAS and connection string**
1. From the results, save the Connection String value, you will use it later.
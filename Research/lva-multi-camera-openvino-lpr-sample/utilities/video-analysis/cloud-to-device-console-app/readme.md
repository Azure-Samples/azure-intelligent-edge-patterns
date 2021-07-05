# Live Video Analytics cloud to device sample console app

This directory contains a dotnet core sample app that would enable you to invoke direct methods exposed by the Live Video Analytics on IoT Edge module. A JSON file (operations.json) defines the sequence of those direct methods, and the parameters for the calls.

## Contents

| File/folder             | Description                                                   |
|-------------------------|---------------------------------------------------------------|
| `c2d-console-app.csproj`| Project file.                                                 |
| `.gitignore`            | Defines what to ignore at commit time.                        |
| `README.md`             | This README file.                                             |
| `operations.json`       | JSON file defining the sequence of direct methods to invoke.  |
| `Program.cs`            | The main program file                                         |

## Setup

Create a file named appsettings.json in this folder. Add the following text and provide values for all parameters.

```JSON
{
    "IoThubConnectionString" : "",
    "deviceId" : "",
    "moduleId" : ""
}
```

* **IoThubConnectionString** - Refers to the connection string of your IoT Hub
* **deviceId** - Refers to your IoT Edge device id (registered with your IoT Hub)
* **moduleId** - Refers to the module id of Live Video Analytics on IoT Edge module (when deployed to the IoT Edge device)

You can run the [LVA resources setup script](https://github.com/Azure/live-video-analytics/tree/master/edge/setup) to generate a **appsettings.json** file with values filled out.

Create a file named .env in src/edge folder and add the following text to it. Provide values for all variables.

```env
SUBSCRIPTION_ID="<your Azure subscription id>"
RESOURCE_GROUP="<your resource group name>"
AMS_ACCOUNT="<name of your Media Services account>"
IOTHUB_CONNECTION_STRING="<IoT Hub connection string>"
AAD_TENANT_ID="<your AAD tenant ID>"
AAD_SERVICE_PRINCIPAL_ID="<your AAD service principal id>"
AAD_SERVICE_PRINCIPAL_SECRET="<your AAD service principal secret>"
INPUT_VIDEO_FOLDER_ON_DEVICE="<a folder on your edge device with MKV files, used by RTSP simulator>"
OUTPUT_VIDEO_FOLDER_ON_DEVICE="<a folder on your edge device used for recording video clips>"
APPDATA_FOLDER_ON_DEVICE="<a folder on your edge device used for storing application data>"
CONTAINER_REGISTRY_USERNAME_myacr="<user name for your Azure Container Registry>"
CONTAINER_REGISTRY_PASSWORD_myacr="<password for the registry>"
```

You can run the [LVA resources setup script](https://github.com/Azure/live-video-analytics/tree/master/edge/setup), which generates the **.env** file with values filled out.

## Running the sample

Detailed instructions for running the sample can be found in the quickstarts (such as [this](https://docs.microsoft.com/azure/media-services/live-video-analytics-edge/detect-motion-emit-events-quickstart) one) and tutorials for Live Video Analytics on IoT Edge. Below is a summary of the key steps.

* Open your local clone of this git repository in Visual Studio Code, have the [Azure Iot Tools](https://marketplace.visualstudio.com/items?itemName=vsciot-vscode.azure-iot-tools) extension installed. 
* Right click on src/edge/deployment.template.json and select **“Generate Iot Edge deployment manifest”**. This will create an IoT Edge deployment manifest file in src/edge/config folder named deployment.amd64.json.
* Right click on src/edge/config /deployment.amd64.json and select **"Create Deployment for single device"** and select the name of your edge device. This will trigger the deployment of the IoT Edge modules to your Edge device. You can view the status of the deployment in the Azure IoT Hub extension (expand 'Devices' and then 'Modules' under your IoT Edge device).
* Right click on your edge device in Azure IoT Hub extension and select **"Start Monitoring Built-in Event Endpoint"**.
* Start a debugging session (hit F5). You will start seeing some messages printed in the TERMINAL window. In the OUTPUT window, you will see messages that are being sent to the IoT Hub by the Live Video Analytics on IoT Edge module.

## Next steps

Experiment with different [graph topologies](https://docs.microsoft.com/azure/media-services/live-video-analytics-edge/media-graph-concept#media-graph-topologies-and-instances) by modifying operations.json.

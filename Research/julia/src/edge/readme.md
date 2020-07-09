# IoT Edge samples

This folder contains IoT Edge deployment manifest templates and sample IoT Edge modules.

## Deployment manifest templates

### deployment.template.json

This file is a deployment manifest template that has the following modules defined in it

* rtspsim - [RTSP simulator module](https://github.com/Azure/live-video-analytics/tree/master/utilities/rtspsim-live555)
* lvaEdge - Live Video Analytics on IoT Edge module

### deployment.yolov3.template.json

In addition to the modules defined in deployment.template.json, this deployment manifest template includes the [yolov3 module](https://github.com/Azure/live-video-analytics/tree/master/utilities/video-analysis/yolov3-onnx). This is an IoT Edge module that runs the YoloV3 ONNX model behind an HTTP endpoint.

### deployment.objectCounter.template.json

In addition to the modules defined in deployment.yolov3.template.json, this deployment manifest template includes the sample objectCounter module (source code for which can be found in ./modules/objectCounter). This template also has message routes defined to send messages from the lvaEdge module to the objectCounter module and vice versa, to enable the scenario of recording video clips when objects of a specified type (at a confidence measure above a specified threshold value) are found. See [this](https://docs.microsoft.com/azure/media-services/live-video-analytics-edge/event-based-video-recording-tutorial) tutorial on using this template.

## Deployment manifest template variables

The deployment manifest templates contains several variables (look for '$' symbol). The values for these variables need to be specified in a .env file that you should create in the same folder as the template files. This file should like the following

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

To generate a deployment manifest from the template, open your local clone of this git repository in Visual Studio Code, have the [Azure Iot Tools](https://marketplace.visualstudio.com/items?itemName=vsciot-vscode.azure-iot-tools) extension installed. Create the .env file with the above variables and their values. Then right click on the template file and select "Generate IoT Edge deployment manifest". This will create the corresponding deployment manifest file in a **./config** folder.

## Sample edge modules

### objectCounter

The folder **./modules/objectCounter** contains source code for an IoT Edge module that counts objects of a specified type and with a confidence above a specified threshold value (these are specified as twin properties in deployment.objectCounter.template.json). The module expects messages emitted by yolov3 module (referenced above).

## Learn more

* [Develop IoT Edge modules](https://docs.microsoft.com/en-us/azure/iot-edge/tutorial-develop-for-linux)

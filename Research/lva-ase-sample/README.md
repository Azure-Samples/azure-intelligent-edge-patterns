---
page_type: sample
languages:
  - csharp
products:
  - azure
  - azure-media-services
  - azure-live-video-analytics
description: "The sample in this repo shows how to use the Live Video Analytics on IoT Edge module to analyze live video using AI modules of your choice and record video on the Azure Stack Edge device."  
---

This tutorial will walk you through setting up an Azure Stack Edge device and deploying the following modules:
- Live Video Analytics
- RTSP simulation
- Yolo V3 machine learning model to detect objects

You can choose to set this up so the RTSP simulation videos are uploaded to the cloud or used locally. This tutorial will set things up to run locally.

# Live Video Analytics on Azure Stack Edge samples

This repository contains C# samples for Live Video Analytics on Azure Stack Edge

## Contents

| File/folder       | Description                                |
|----------------------|--------------------------------------------|
| `src`                | Sample source code.                        |
| `.gitignore`         | Defines what to ignore at commit time.     |
| `README.md`          | This README file.                          |

The 'src' folder contains three sub-folders

* **cloud-to-device-console-app** - This folder contains a dotnet core console app that enables you to invoke direct methods of Live Video Analytics on IoT Edge module, with parameters defined by you in a JSON file (operations.json).
* **edge** - This folder has a few IoT Edge deployment manifest templates, along with sample code for an IoT Edge module (under 'modules' folder) that can be used in conjunction with the Live Video Analytics on IoT Edge module. The setup resources are also found here.
* **ams-asset-player** - This folder contains a ASP dotnet core app that showcases how you can playback assets recorded by Live Video Analytics on IoT Edge (in the Azure Media Services account referenced in the module twin properties).

## Prerequisites

1. An active Azure subscription with owner level permissions
2. [Visual Studio Code](https://code.visualstudio.com/) on your development machine with following extensions

    a. [Azure IoT Tools](https://marketplace.visualstudio.com/items?itemName=vsciot-vscode.azure-iot-tools)

    b. [C#](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csharp)

3. [.NET Core 3.1 SDK](https://dotnet.microsoft.com/download/dotnet-core/3.1) on your development machine
4. Azure Stack Edge device

## SETUP THE AZURE STACK EDGE ##
Complete the [setup](https://docs.microsoft.com/en-us/azure/databox-online/azure-stack-edge-deploy-prep) for your Azure Stack Edge with the following notes in mind:
* Whenever asked to choose a location you use __WESTUS2__ as this is the only supported location for Live Video Analytics as of July 2020
* Before enabling compute from the Azure Portal, make sure to enable the network interface
* Provide at least three Kubernetes external service IPs in your local UI network settings when configuring compute (you need one per module) 
	
Now let's make sure you can connect to your device from your local machine
Open a PowerShell window and open your hosts file by running the following command
``` notepad C:\Windows\System32\drivers\etc\hosts ```

Here you will add two entries
* device IP device name
	* You should have already added this during the ASE tutorial
	* note the space between device IP and name!
* Kubernetes API service IP Kubernetes API service endpoint

#### Get the sample camera stream
Since we don't have an actual camera to stream from, we will use a simulated video. Download the file from [here](https://lvamedia.blob.core.windows.net/public/camera-300s.mkv) and place it in your local share on your ASE. It should be titled 'camera-300s.mkv' but if you choose to use another video, make sure to update the operations.json file so that the rtspUrl points at the correct file. 

## SET UP LVA RESOURCES: ##

Follow the directions in the setup [readme file](https://github.com/julialieberman/azure-intelligent-edge-patterns/blob/t-jull-lvasample/Research/lva-ase-sample/src/edge/setup/readme.md)

## Running the sample from VS Code
Open your local clone of this git repository in Visual Studio Code.

Follow the instructions outlined in [src/cloud-to-device-console-app/readme.md](https://github.com/julialieberman/azure-intelligent-edge-patterns/tree/t-jull-lvasample/Research/lva-ase-sample/src/cloud-to-device-console-app/readme.md) to setup the console app and next steps, and instructions in **src/ams-asset-player/readme.md** to setup the ASP dotnet core app.

## Key concepts

Read [Live Video Analytics on IoT Edge concepts](https://docs.microsoft.com/en-us/azure/media-services/live-video-analytics-edge/overview)

## Code of conduct

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

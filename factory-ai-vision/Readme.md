| description                                                                                                                                                                                                                          | products                                                               | page_type       | description                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- | --------------- | ------------------------------- |
| This is an easy-to-use UI solution showing how to realize a your own machine learning solution concept in a single day without requiring any Machine Learning expertise, run with hardware accleration on edge with retraining loop. | - azure Stack<br/> -Custom Vision<br/>-Onnxruntime<br/>-azure-iot-edge<br/>-AVA Pipeline <br/>*RTSP Source <br/>*HTTP/GRPC Extension   | sample solution | -json<br>-python<br>-javascript |

# Vision on Edge Solution

This is a solution showing how to deploy a Custom Vision model to Azure IoT edge device and get Machine learning solution up and running in a single day.
You can define your location, camera and set up objects to detect example: any manufacturing parts, defected parts, etc. while keeping your video footage private, lowering your badnwidth costs and even running everything offline. This solution is capable of processing multiple cameras using Microsoft AVA.

Check out [this video](https://www.youtube.com/watch?v=17UW6veK7SA) to see brief introduction in action and understand how the value is delivered:

[![video](https://raw.githubusercontent.com/linkernetworks/azure-intelligent-edge-patterns/linker/factory-ai-vision/assets/Ignite42021.jpg)](https://www.youtube.com/watch?v=17UW6veK7SA)

## What's New

<img src="/assets/VoEGH.gif" width="250" height="250"/>

## Product

- Azure Stack Edge: Learn more [here](https://azure.microsoft.com/en-us/products/azure-stack/edge/)
- Azure Stack HCI: Learn more [here](https://azure.microsoft.com/en-us/products/azure-stack/hci/)
- Custom Vision: Learn more [here](https://azure.microsoft.com/en-us/services/cognitive-services/custom-vision-service/)
- Azure-iot-edge <br/>
- AKS/AKS-HCI
- OpenVINO/cpu <br/>
- AVA Pipeline: Learn more [here](https://azure.microsoft.com/en-us/products/video-analyzer/)


# Table of Content

- [Prerequisites](#prerequisites)
  * [Hardware](#hardware)
  * [Services](#services)
- [Architecture](#architecture)
    + [AVA Module](#ava-module)
- [Get Started: Vision on Edge Installer](#get-started-vision-on-edge-installer)
  * [For Azure IoT Edge](#for-azure-iotedge-devices-recommended)
    + [Option 1: Azure Shell Installer](#option-1-azure-shell-installer-recommended)
    + [Option 2: Azure ARM Template](#option-2-azure-arm-template)
- [Other Tutorials](#other-tutorials)
  * [Video Tutorials](#video-tutorials)
  * [Upload your own video to be processed](#upload-your-own-video-to-be-processed)
- [Troubleshooting](#troubleshooting)
- [Privacy Notice](#privacy-notice)

# Prerequisites

## Hardware

You need to have one of the following:

- **Azure Stack Edge**: A portfolio of devices that bring the compute, storage and intelligence to the edge right where data is created. Find out more [here](https://azure.microsoft.com/en-us/products/azure-stack/edge/)
  - Please ensure that you have compute configured and you can run [GPU getting started module here](https://docs.microsoft.com/en-us/azure/databox-online/azure-stack-edge-gpu-deploy-sample-module-marketplace)
- **Azure Stack HCI**: A hyperconverged infrastructure (HCI) cluster solution that hosts virtualized Windows and Linux workloads and their storage in a hybrid, on-premises environment. Find out more [here](https://docs.microsoft.com/en-us/azure-stack/hci/overview). You can either:
  - Create a linux VM in your HCI environment by following [this](https://docs.microsoft.com/en-us/azure-stack/hci/manage/vm) and then follow this to [install IoT Edge](https://docs.microsoft.com/en-us/azure/iot-edge/how-to-install-iot-edge-linux) in your VM. (You can attach a GPU to HCI VM by following [this instruction](https://docs.microsoft.com/en-us/azure-stack/hci/manage/attach-gpu-to-linux-vm))
  - Create AKS-HCI in your HCI enviroment by following [this](https://docs.microsoft.com/en-us/azure-stack/aks-hci/overview) (VoE Kubernetes deployment is currently in Beta)

or

- **Simulated Azure IoT Edge device** (such as a PC): Set up Azure IoT Edge [instructions on Linux](https://docs.microsoft.com/en-us/azure/iot-edge/how-to-install-iot-edge-linux) and use the amd64 tags. A test x64 deployment manifest is already available.
  - For running on CPU : A x64 ubuntu machine with docker + Azure Iot edge working
  - For running on GPU : Azure Stack Edge OR Azure/Azure Stack Hub NCv2 Ubuntu VM with Nvidia Docker + Nvidia driver + Azure Iot Edge
 
#### NOTE: This solution is only supported on Linux based Azure IoTEdge devices. Kubernetes deployment is currently in Beta and is through our [Helm Chart](#option-1-voe-helm-chart-recommended).

Vision on Edge (VoE) also uses/requires a few Azure services for its various capabilities. Some of these services will be automatically deployed for you (during VoE installation) while others may need you to pre-deploy them before installing VoE. Please follow the VoE installation paths discussed below for more information.

## Services

Check out the architecture below to see how Vision on Edge uses various services to function. Depending on your deployment target VoE will need the following Azure services as prerequisites:

- IoTEdge Devices: Azure Custom Vision + IoT Hub + Azure Video Analyzer (Recommended). Only VM deployment is supported.

# Architecture

### AVA Module

![arch_img](/assets/OVSM-AVA-Arch.png)


# Get Started: Vision on Edge Installer

## For Azure IoTEdge Devices (Recommended)

**Follow our IoTEdge deployment options only for VM based deployments. For Kubernetes deployments please follow [this](#option-1-voe-helm-chart-recommended).**

### Option 1: Azure Shell Installer (Recommended)

Please follow the [instructions given here](Tutorial/Shell-installer-Tutorial.md) to install VoE using Azure Shell.

### Option 2: Azure ARM Template

please follow the document to follow instruction  https://github.com/Azure-Samples/azure-intelligent-edge-patterns/blob/master/factory-ai-vision/Tutorial/Tutorial_ARM_TemplateDeployment.md

[![Deploy to Azure ARM](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Flinkernetworks%2Fazure-intelligent-edge-patterns%2Ffeat%2Fcascade-dev%2Ffactory-ai-vision%2FDeploy%2Farm%2Farmdeploy.json)


# Other Tutorials 

## Video Tutorials

- Tutorial 1: Azure Shell Installer [https://youtu.be/6sDILwkP1yc]

- Tutorial 2 - Start with prebuilt scenario [https://youtu.be/dihAdZTGj-g]

- Tutorial 3 - Start with creating new project, capture images, tagging images and deploy [https://youtu.be/cCEW6nsd8xQ]

- Tutorial 4 - Retraining and improve your model [https://youtu.be/OxK9feR_T3U]

- Tutorial 5: Advance capabilities setting [https://youtu.be/Bv7wxfFEdtI]

## Upload your own video to be processed

If you don't have camera devices to connect to your VoE deployment, you can use your own videos by uploading them to your edge device. Please follow the instruction [here](https://github.com/Azure-Samples/azure-intelligent-edge-patterns/blob/master/factory-ai-vision/Tutorial/UploadVideo.md).

# Privacy Notice

The software may collect information about your use of the software and send it to Microsoft.
Microsoft may use this information to provide services and improve our products and services.
You may turn off the telemetry as described in the repository or clicking settings on top right
corner. Our privacy statement is located at [https://go.microsoft.com/fwlink/?LinkID=824704](https://go.microsoft.com/fwlink/?LinkID=824704)
. You can learn more about data collection and use in the help documentation and our privacy
statement. Your use of the software operates as your consent to these practices.

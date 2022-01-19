| description                                                                                                                                                                                                                          | products                                                               | page_type       | description                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- | --------------- | ------------------------------- |
| This is an easy-to-use UI solution showing how to realize a your own machine learning solution concept in a single day without requiring any Machine Learning expertise, run with hardware accleration on edge with retraining loop. | -Azure Stack<br/> -Azure Percept<br/> -Custom Vision<br/>-Onnxruntime<br/>-OpenVINO Model Server<br/>-OpenVINO <br/>-Azure IoTEdge<br/>-AVA<br/>-RTSP Source <br/>-HTTP/GRPC Extension   | sample solution | -json<br>-python<br>-javascript |

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# Vision on Edge (VoE)

Vision on Edge (VoE) is an open-source tool that accelerates and simplifies the journey of building vision-based intelligent edge solutions using Machine Learning (ML). VoE helps you with extracting insights and actions from RTSP IP cameras using a no-code UI that runs and processes streams locally on your edge device.

Check out [this video](https://www.youtube.com/watch?v=17UW6veK7SA) to see brief introduction in action and understand how the value is delivered:

[![video](https://raw.githubusercontent.com/linkernetworks/azure-intelligent-edge-patterns/linker/factory-ai-vision/assets/Ignite42021.jpg)](https://www.youtube.com/watch?v=17UW6veK7SA)

## Overview

Gaining meaningful insights from the physical world can be quite complex and time consuming. Camera is quickly becoming the one universal sensor that can capture the essence of the physical world for many different use cases. To be able to reason about your desired events happening in the physical world using cameras you need to be able to ingest, process and reason about many camera streams at once. Creating a video ingestion process with only 1 camera is not an easy task but creating a scalable, yet extensible video pipeline is even more difficult. In addition, understanding things/objects in the physical world requires algorithms that are not easy to build without specialized knowledge and resources. 

<p align="center">
<img src="assets/VoEGH.gif" width="800"/>
</p>

VoE combines the power of Azure services such as Custom Vision and Video Analyzer in one simple and easy to use local UI that helps you:
- Connect and view your IP cameras
- Train your own custom ML models from scratch using training data from your IP cameras
- Create a more complex AI Skill/Logic by combining your custom ML models with already trained models from our model zoo
- Deploy your hardware optimized ML models on your IP camera streams to extract insights and create actions locally or in the cloud

## Concepts

You can get started learning about VoE's user concepts [here](Tutorial/concepts.md).

## Prerequisites and Architecture

Learn about VoE's architecture and its technical requirements in [this document](Tutorial/req_arch.md).

# Get Started

## Deploy

You can deploy VoE to your edge or [simulated](https://docs.microsoft.com/en-us/azure/iot-edge/how-to-install-iot-edge-linux) device either through a shell installer or Azure ARM template. 

**If you don't have camera devices to connect to your VoE portal, you can use your own videos by uploading them to your edge device. Please follow the instruction [here](https://github.com/Azure-Samples/azure-intelligent-edge-patterns/blob/master/factory-ai-vision/Tutorial/UploadVideo.md).**

### Option 1: Azure Shell Installer (Recommended)

Please follow the [instructions given here](Tutorial/Shell-installer-Tutorial.md) to install VoE using Azure Cloud Shell.

### Option 2: Azure ARM Template

[![Deploy to Azure ARM](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Flinkernetworks%2Fazure-intelligent-edge-patterns%2Ffeat%2Fcascade-dev%2Ffactory-ai-vision%2FDeploy%2Farm%2Farmdeploy.json)

Please follow [this document](Tutorial/Tutorial_ARM_TemplateDeployment.md) to learn more about our Azure ARM deployment.


## Video Tutorials

- Tutorial 1: Azure Shell Installer [https://youtu.be/6sDILwkP1yc]

- Tutorial 2 - Start with prebuilt scenario [https://youtu.be/dihAdZTGj-g]

- Tutorial 3 - Start with creating new project, capture images, tagging images and deploy [https://youtu.be/cCEW6nsd8xQ]

- Tutorial 4 - Retraining and improve your model [https://youtu.be/OxK9feR_T3U]

- Tutorial 5: Advance capabilities setting [https://youtu.be/Bv7wxfFEdtI]


# Privacy Notice

The software may collect information about your use of the software and send it to Microsoft.
Microsoft may use this information to provide services and improve our products and services.
You may turn off the telemetry as described in the repository or clicking settings on top right
corner. Our privacy statement is located at [https://go.microsoft.com/fwlink/?LinkID=824704](https://go.microsoft.com/fwlink/?LinkID=824704)
. You can learn more about data collection and use in the help documentation and our privacy
statement. Your use of the software operates as your consent to these practices.

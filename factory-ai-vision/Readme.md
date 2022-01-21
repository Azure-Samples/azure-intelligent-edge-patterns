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

<<<<<<< HEAD
 
## Get Started 
To install the Vision on Edge Solution Accelerator, the following prerequisites are required...
  1.	You must have the Azure CLI installed on your system. See [this document](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest) for information on how to install the CLI
  2.	You must have an Azure subscription
  3.	That subscription must contain an IoT Hub with a registered IoT Edge device (generally this will be an Azure Stack Edge Device), port 5000 and 8181 need to be opened in the IoT Edge device/vm
  4.	If you choose to deploy a new instance of Custom Vision service, this installer will try to install the free version. If you have an existing free version, install will fail.

# Vision on Edge Installer
## Option 1: Automated installation with Vision on Edge Installer

### Prerequisites
To install the solution on a PC running Windows, unpack the installation zip, navigate to the directory containing the unziped files in a terminal, and run the factory-ai-vision-install.cmd script.

To install the solution on a Mac, or a PC running Linux, unpack the installation zip, navigate to the directory containing the unziped files in a terminal, and run the factory-ai-vision-install.sh script.

Before installation, please make sure you have the following: 
   1.	At least one IoT Edge with Port 8181 and 5000 is opended and is connected to your Iot Hub. please follow this documentation for [deployment information](https://docs.microsoft.com/en-us/azure/iot-edge/quickstart-linux) 
   2.	Azure Custom Vision account, see the below link to find your training key [here](https://www.customvision.ai/projects#/settings)
### Get Started:
Go to factory-ai-vision repo and click on Installers folder, there are two zip files, [Windows.zip](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/Installers/Windows.zip) and [bash.zip](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/Installers/bash.zip) 

For Windows: 
   1.	Click and download the [Windows.zip](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/Installers/Windows.zip), and unzip the zipped files. It contains three files:
   a. deploy-custom-vision-arm.json
   b. deployment.amd64.json 
   c. factory-ai-vision-install.cmd
   2.	Open the factory-ai-vision-install.cmd file and start running the installation. 
      It will open the terminal windows and ask for your Azure subscription. 
   3.	Choose your subscription
   4.	Choose whether if you are using existing Custom Vision service or creating a new one. Then input your endpoint and key information. 
   5.	Choose where is your targeted edge device and confirm whether your device (GPU or CPU) 
   6.   This solution takes 5-10 mins to install based on your internet speed, After 5-10 mins open your browser and connect to ```http://<your-edge-ip:8080>.

For Mac:
   1.	Open terminal 
   2.	Locate the file, [unzip bash.zip](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/Installers/bash.zip)
   3.	excute ```bash factory-ai-vision-install.sh```
   4.	It will direct you to azure subscription login page
   5.	Choose your subscription 
   6.	Choose whether if you are using existing Custom Vision service or creating a new one. Then input your endpoint and key information. 
   7.	Choose where is your targeted edge device and confirm whether your device (GPU or CPU) 
   8.   This solution takes 5-10 mins to install based on your internet speed, After 5-10 mins open your browser and connect to ```http://<your-edge-ip:8080>.

## Option 2: Manual installation building a docker container and deploy by Visual Studio Code

### Prerequisites

Before installation, You must have the following services set up to use Vision on Edge:
   1.	**Docker**: installed in your local environment. You can find information in the following document https://docs.docker.com/get-docker/
   2.	**IoT Edge Port**: At least one IoT Edge with Port 8080 and 5000 is opended and is connected to your Iot Hub. please follow this documentation for deployment information  https://docs.microsoft.com/en-us/azure/iot-edge/quickstart-linux 
   3.	**Azure Custom Vision account**, see the below link to find your training key here https://www.customvision.ai/projects#/settings
   4.	**Azure Container Registry**, please follow the document to create one https://docs.microsoft.com/en-us/azure/container-registry/
   5.	**Visual Studio Code**: IoT Edge development environment. [Download it from here](https://code.visualstudio.com/).
   6. **Visual Studio Code: Azure IoT Edge Extension**: An extension that connects to your IoT Hub and lets you manage your IoT Devices and IoT Edge Devices right from VS Code. A must-have for IoT Edge development. [Download it from here](https://marketplace.visualstudio.com/items?itemName=vsciot-vscode.azure-iot-edge). Once installed, connect it to your IoT Hub.
 
To learn more about this development environment, check out [this tutorial](https://docs.microsoft.com/en-us/azure/iot-edge/how-to-deploy-modules-vscode) and [this video](https://www.youtube.com/watch?v=C5eTQ1cwlLk&t=1s&index=35&list=PLlrxD0HtieHh5_pOv-6xsMxS3URD6XD52):
=======
# Get Started
>>>>>>> feat/cascade-dev

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


3. If the inference & visionweb modules exist but still cannot see the page in 8080 port, check whether 8080 port on your edge is opened.
4. If you can visit the website (in 8181 port) but not see the inference result video after clicking configuration in the Part Identification page, please check whether your edge's 5000 port is opened

# Installation Guide (New Version)

We provide two ways:
- Installer, a shell script that will deploy the prebuild docker images
- Build from source, build the docker images by yourself and deploy

## Prerequisite
- An active Azure subscription
- Azure resources deployed in the Azure subscription
    
    a. Azure IoT Hub
    
    b. Azure Media Services
    
    c. Azure container registry

- A GPU Linux edge device with IoT Edge runtime (with port 8080 and 5000 opened)
- (Build from source only)[Visual Studio](https://code.visualstudio.com/) Code on your development machine with following extensions
    
    a. [Azure IoT Tools](https://marketplace.visualstudio.com/items?itemName=vsciot-vscode.azure-iot-tools)
    
    b. [Python](https://marketplace.visualstudio.com/items?itemName=ms-python.python)

- (Build from source only)[Docker](https://docs.docker.com/engine/install/) on your development machine


### Installer (Method1)
1. Open your browser, connect to https://shell.azure.com/ , switch to Bash
2. Download acr.zip from github ```wget https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/linker/factory-ai-vision/Installer/acs.zip```
3. Unzip it ```unzip acs.zip```
4. Execute the installer ```bash factory-ai-vision-install.sh```
5. During the, you will enter your customvision credentials (optional), select your Azure Media Service, IoTHub, and Edge device. Note that if it's your first time to deploy, it will create a service principal for Azure Media Service, please backup the ```SERVICE_PRINCIPAL_SECRET``` by your own, which will be shown in the screen while selecing Azure Media Service. It won't be shown again once creating. If it's not the first time doing deployment via Installer, you will be asked to enter that secret
6. If it's the first time deployment, you will be expected to wait around 10-15 minutes
7. Open your browser, connect to http://YOUR_IP:8181

### Build from source code (Method2)
- Clone yadavm_factoryai_lpr branch 

    ```bash
    git clone https://github.com/Azure-Samples/azure-intelligent-edge-patterns.git --single-branch --branch yadavm_factoryai_lpr
    ```

- Go to factoryai directory and open your vscode

    ```bash
    cd azure-intelligent-edge-patterns/factory-ai-vision
    code .
    ````
    
- Edit the ```env-template``` file, you should see something like this

    ```bash
    # For Azure Container Registry
    CONTAINER_REGISTRY_NAME=""
    CONTAINER_REGISTRY_USERNAME=""
    CONTAINER_REGISTRY_PASSWORD=""

    # For Azure IoT Hub
    IOTHUB_CONNECTION_STRING=""

    # FOR Media Services
    SUBSCRIPTION_ID=""
    RESOURCE_GROUP=""
    TENANT_ID=""
    SERVICE_NAME=""
    SERVICE_PRINCPAL_APP_ID=""
    SERVICE_PRINCIPAL_SECRET=""
    ```

- Please fill in your credentials and rename it as ```.env```, vscode will use this file to set the environment variables

- Find ```deployment.gpu.template.json``` under ```EdgeSolution``` directory in vscode, right click on it, choose "Build and Push Iot Edge Solution". It'll start to build the container, you should expect to wait for more than 10 mins if it's the first time you build the container.

- Find  ```deployment.gpu.amd64.json``` under ```EdgeSolution/config``` directory in vscode, right click on it, choose "Create Deployment to Single Device", select your device to deploy, you should expect the edge will pull the container for more than 10 mins if it's the first time.

- Go to your device (via ssh), use `docker ps` to check whether all the modules are pulled and running. You should see 6 modules running including:

    a. visionwebmodule
    
    b. inferencemodule
    
    c. rtspsimmodule
    
    d. webdbmodule
    
    e. azureiotedge-hub
    
    f. azureiotedge-agent
    
- Please wait until all 6 are running. Open your browser and connect http://YOUR_IP:8181
# Privacy Notice

The software may collect information about your use of the software and send it to Microsoft.
Microsoft may use this information to provide services and improve our products and services.
You may turn off the telemetry as described in the repository or clicking settings on top right
corner. Our privacy statement is located at [https://go.microsoft.com/fwlink/?LinkID=824704](https://go.microsoft.com/fwlink/?LinkID=824704)
. You can learn more about data collection and use in the help documentation and our privacy
statement. Your use of the software operates as your consent to these practices.

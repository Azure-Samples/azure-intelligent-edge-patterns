| description                                                                                                                                                                                                                          | products                                                               | page_type       | description                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- | --------------- | ------------------------------- |
| This is an easy-to-use UI solution showing how to realize a your own machine learning solution concept in a single day without requiring any Machine Learning expertise, run with hardware accleration on edge with retraining loop. | - azure Stack<br/> -Custom Vision<br/>-Onnxruntime<br/>-azure-iot-edge<br/>-AVA Pipeline <br/>*RTSP Source <br/>*HTTP/GRPC Extension   | sample solution | -json<br>-python<br>-javascript |

# Vision on Edge Solution

This is a solution showing how to deploy a Custom Vision model to Azure IoT edge device and get Machine learning solution up and running in a single day.
You can define your location, camera and set up objects to detect example: any manufacturing parts, defected parts, etc. while keeping your video footage private, lowering your badnwidth costs and even running everything offline. We use onnxruntime to acclerate your models on edge device using Open Vino for CPU and TensorRT for Nvidia GPU and Arm64 GPU. This solution is capable of processing multiple cameras with Microsoft AVA and OpenCV.

Check out [this video](https://www.youtube.com/watch?v=17UW6veK7SA) to see brief introduction in action and understand how the value is delivered:

[![video](https://raw.githubusercontent.com/linkernetworks/azure-intelligent-edge-patterns/linker/factory-ai-vision/assets/Ignite42021.jpg)](https://www.youtube.com/watch?v=17UW6veK7SA)

## Product

- Azure Stack Edge: Learn more [here](https://azure.microsoft.com/en-us/products/azure-stack/edge/)
- Azure Stack HCI: Learn more [here](https://azure.microsoft.com/en-us/products/azure-stack/hci/)
- Custom Vision: Learn more [here](https://azure.microsoft.com/en-us/services/cognitive-services/custom-vision-service/)
- Onnxruntime<br/>
- Azure-iot-edge <br/>
- AKS/AKS-HCI
- OpenVINO/cpu <br/>
- TensorRT for Nvidia/gpu <br/>
- Arm64/cpu <br/>
- AVA Pipeline: Learn more [here](https://azure.microsoft.com/en-us/products/video-analyzer/)


# Table of Content

- [Prerequisites](#prerequisites)
  * [Hardware](#hardware)
  * [Services](#services)
- [Architecture](#architecture)
    + [AVA Module (Recommended)](#ava-module-recommended)
    + [OpenCV Module](#opencv-module)
- [Get Started: Vision on Edge Installer](#get-started-vision-on-edge-installer)
  * [For Azure IoT Edge](#for-azure-iotedge-devices-recommended)
    + [Option 1: Azure Shell Installer](#option-1-azure-shell-installer-recommended)
    + [Option 2: Azure ARM Template](#option-2-azure-arm-template)
  * [For Kubernetes (AKS/AKS-HCI/ASE K8s)(Beta)](#for-kubernetes-aksaks-hciase-k8sbeta)
    + [Option 1: VoE Helm Chart (Recommended)](#option-1-voe-helm-chart-recommended)
    + [Option 2: Static Kubernetes YAML](#option-2-static-kubernetes-yaml)
      - [AKS](#aks)
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
- Kubernetes (AKS-HCI): Azure Custom Vision + IoT Hub

# Architecture

### AVA Module (Recommended)

![arch_img](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/linker/factory-ai-vision/assets/AVAarch.png)

### OpenCV Module

![arch_img](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/linker/factory-ai-vision/assets/newarch2.png)

You can refer to these API documents for details: <br/>
InferenceModule https://documenter.getpostman.com/view/13850891/TVsoGqcE <br/>
PredictModule https://documenter.getpostman.com/view/13850891/TVsoGqcG <br/>
WebModule https://documenter.getpostman.com/view/13850891/TVsoHAQT <br/>

 
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

# Get Started: Vision on Edge Installer

## For Azure IoTEdge Devices (Recommended)

**Follow our IoTEdge deployment options only for VM based deployments. For Kubernetes deployments please follow [this](#option-1-voe-helm-chart-recommended).**

### Option 1: Azure Shell Installer (Recommended)

Please follow the [instructions given here](Tutorial/Shell-installer-Tutorial.md) to install VoE using Azure Shell.

### Option 2: Azure ARM Template

[![Deploy to Azure ARM](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2FAzure-Samples%2Fazure-intelligent-edge-patterns%2Fmaster%2Ffactory-ai-vision%2FDeploy%2Farm%2Farmdeploy.json)

Please follow [the following document](Tutorial/Tutorial_ARM_TemplateDeployment.md) to learn more about our Azure ARM deployment.

## For Kubernetes (AKS/AKS-HCI/ASE K8s)(Beta)

### Option 1: VoE Helm Chart (Recommended)

Please follow the [instructions given here](Tutorial/K8s_helm_deploy.md) to install VoE on Kubernetes (AKS/AKS-HCI) using our Helm chart.

### Option 2: Static Kubernetes YAML

#### AKS:
Please follow the [instructions here](Tutorial/AKS_deploy.md) to deploy to AKS.


# Other Tutorials 

## Video Tutorials

- Tutorial 1: Azure Shell Installer [https://youtu.be/6sDILwkP1yc]

- Tutorial 2 - Start with prebuilt scenario [https://youtu.be/dihAdZTGj-g]

- Tutorial 3 - Start with creating new project, capture images, tagging images and deploy [https://youtu.be/cCEW6nsd8xQ]

- Tutorial 4 - Retraining and improve your model [https://youtu.be/OxK9feR_T3U]

- Tutorial 5: Advance capabilities setting [https://youtu.be/Bv7wxfFEdtI]

## Upload your own video to be processed

If you don't have camera devices to connect to your VoE deployment, you can use your own videos by uploading them to your edge device. Please follow the instruction [here](https://github.com/Azure-Samples/azure-intelligent-edge-patterns/blob/master/factory-ai-vision/Tutorial/UploadVideo.md).


# Troubleshooting

If you are running into issues, please check following for assistant:

1. Ensure your setup is good
   1. On CPU make sure this work: [https://azuremarketplace.microsoft.com/en-us/marketplace/apps/azure-iot.simulated-temperature-sensor?tab=Overview](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/azure-iot.simulated-temperature-sensor?tab=Overview)
   2. On GPU make sure this work:
      1. Quick test : run below command this will try to access nvidia gpu inside docker
         - `sudo docker run --runtime=nvidia --rm nvidia/cuda nvidia-smi`
      2. Long test :: deploy below from marketplace on your iot edge device and make sure it works
         [https://azuremarketplace.microsoft.com/en-us/marketplace/apps/intelligent-edge.gpureferencemodule?tab=Overview](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/intelligent-edge.gpureferencemodule?tab=Overview)
2. If this is the first time you deploy the container to your edge, you might need to wait for more than 10 mins. You can use ssh to connect to your edge and try sudo docker ps., then you should see following 2 containers running:
   YOUR_CONTAINER_REGISTRY_NAME/inferencemodule:x.x.xx-cpuamd64 (or gpu)
   YOUR_CONTAINER_REGISTRY_NAME/webmodule:x.x.xx-cpuamd64

   If you don’t see above, the containers aren't downloaded successfully yet

3. If the inference & visionweb modules exist but still cannot see the page in 8181 port, check whether 8181 port on your edge is opened.
4. If you can visit the website (in 8181 port) but not see the inference result video after clicking configuration in the Part Identification page, please check whether your edge's 5000 port is opened.


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

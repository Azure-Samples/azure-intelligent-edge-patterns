
| languages                  | products                                                              | page_type       | description                                                                                                                                                                                                                          | urlFragment             |
| -------------------------- | --------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------- |
| -json<br>-python<br>-javascript | -azure Stack<br>-Custom Vision<br>-Onnxruntime<br>-azure-iot-edge | sample solution | This is an easy-to-use UI solution showing how to realize a your own machine learning solution concept in a single day without requiring any Machine Learning expertise, run with hardware accleration on edge with retraining loop. | custom-vision-azure-iot |




# Custom vision + Azure IoT Edge for Factory AI

This is a sample showing how to deploy a Custom Vision model to Azure IoT edge device and get Machine learning solution up and running in a single day.
You can define your location, camera and set up objects to detect example: any manufacturing parts, defected parts, etc. while keeping your video footage private, lowering your badnwidth costs and even running everything offline. We use onnxruntime to acclerate your models on edge device using Open Vino for CPU and TensorRT for Nvidia GPU.


Check out [this video](https://lnkd.in/grQKBN8) to see brief introduction in action and understand how the value is delievered: 
[![video](https://github.com/Azure-Samples/azure-intelligent-edge-patterns/blob/master/factory-ai-vision/assets/Ignite.JPG)](https://lnkd.in/grQKBN8)


<!-- # Prerequiste -->

<!--## Hardware

<!--You need to have one of the following:

<!-- - **Azure Stack Edge**
  or
- **Simulated Azure IoT Edge device** (such as a PC): Set up Azure IoT Edge [instructions on Linux](https://docs.microsoft.com/en-us/azure/iot-edge/how-to-install-iot-edge-linux) and use the amd64 tags. A test x64 deployment manifest is already available.
  - For running on CPU : A x64 ubuntu machine with docker + Azure Iot edge working
  - For running on GPU : Azure Stack Edge OR Azure/Azure Stack Hub NCv2 Ubuntu VM with Nvidia Docker + Nvidia driver + Azure Iot Edge

<!-- ### NOTE:This solution is only supported on linux based Azure IoT edge devices -->



# Prerequiste
## Hardware
You need to have one of the following:
-	**Azure Stack Edge**  
-   Please ensure that you have compute configured and you can run [GPU getting started module here](https://docs.microsoft.com/en-us/azure/databox-online/azure-stack-edge-gpu-deploy-sample-module-marketplace)

or
- **Simulated Azure IoT Edge device** (such as a PC): Set up Azure IoT Edge [instructions on Linux](https://docs.microsoft.com/en-us/azure/iot-edge/how-to-install-iot-edge-linux) and use the amd64 tags. A test x64 deployment manifest is already available.
     * For runing on CPU : A x64 ubuntu machine with docker + Azure Iot edge working
     * For runnign on GPU : Azure Stack Edge OR Azure/Azure Stack Hub NCv2 Ubuntu VM with Nvidia Docker + Nvidia driver + Azure Iot Edge
### NOTE:This solution is only supported on linux based Azure IoT edge devices 

## Services

Check out the architecture below to see how Vision on Edge works. You can also get more details through this tutorial to see how a IoT Edge deployment works. You must have the following services set up to use this solution:

# Architecture

![arch_img](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/develop/factory-ai-vision/assets/factoryaidiagram.png)

## Get Started

To install the Vision on Edge Solution Accelerator, the following prerequisites are required...

1. You must have an Azure subscription.
2. That subscription must contain an IoT Hub with a registered IoT Edge device (generally this will be an Azure Stack Edge Device), port 5000 and 8181 need to be opened in the IoT Edge device/vm.
3. If you choose to deploy a new instance of Custom Vision service, this installer will try to install the free version. If you have an existing free version, install will fail.

# Vision on Edge Installer

### Prerequisites


Before installation, please make sure you have the following: 
   1.	At least one IoT Edge with port 8181 and 5000 opened and is connected to your Iot Hub. please follow this documentation for [deployment information](https://docs.microsoft.com/en-us/azure/iot-edge/quickstart-linux) 
   2.	Azure Custom Vision account, see the below link to find your training key [here](https://www.customvision.ai/projects#/settings)
   3.   Azure Media Service, please follow the document to create one https://docs.microsoft.com/en-us/azure/media-services/latest/create-account-howto?tabs=portal
   
### Get Started:
Go to factory-ai-vision repo and click on Installers folder, there are two zip files, [Windows.zip](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/Installers/Windows.zip) and [bash.zip](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/Installers/bash.zip) 

1. Open your browser and paste the linke https://shell.azure.com/  to open the shell installer. And choose “bash” mode
2. You will need a Azure subscription to continue
![arch_img](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/develop/factory-ai-vision/assets/step1.png)
3. To download acs.zip from github by pasting `wget https://github.com/Azure-Samples/azure-intelligent-edge-patterns/raw/master/factory-ai-vision/Installer/acs.zip`
![arch_img](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/develop/factory-ai-vision/assets/step2.png)
4. Unzip it `unzip acs.zip`. The file name can be found above if different from acs.zip listed above. 
![arch_img](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/develop/factory-ai-vision/assets/step3.png)
5. Execute the installer `bash factory-ai-vision-install.sh`

6. It will check the az command and check if installing/updating the IoT extension
<br/>You would be asking:
<br/>Would you like to use an existing Custom Vision Service? (y or n):  y 
<br/>If you choose “yes”, you will asking to input endpoint and key.
<br/>Please enter your Custom Vision endpoint: xxxxxx
<br/>Please enter your Custom Vision Key: xxxxxx
![arch_img](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/develop/factory-ai-vision/assets/step4.png)

7. If you choose not to use existing account, please go ahead to create a new one with the instruction
![arch_img](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/develop/factory-ai-vision/assets/step5.png)

8. Do you want to use Azure Live Video Analytics? (y or n): 
<br/>If you choose yes, 
<br/>Select from one of listing Azure Media Service 
<br/>And Choose the number corresponding to your Azure Media Service 
![arch_img](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/develop/factory-ai-vision/assets/step6.png)

9. Or if you don’t have one, it will create new azure media service principle for you. 
<br/>And please copy the information 
<br/>You will need the secret information for later usage 
![arch_img](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/develop/factory-ai-vision/assets/step7.png)
<br/>If you would like to install with opencv version, please input “no”

10. There will be a list of IoT hubs, please choose “customvision”
![arch_img](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/develop/factory-ai-vision/assets/step8.png)

11. It will show a list of devices in your account, and choose the device to install your visiononedge 
<br/>You will be asking if your device have a GPU or not
![arch_img](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/develop/factory-ai-vision/assets/step9.png)

12. The installation will be started after. 
<br/>Open your browser, connect to http://YOUR_IP:8181


## Option 2: Manual installation building a docker container and deploy by Visual Studio Code

### Prerequisites

Before installation, You must have the following services set up to use Vision on Edge:

1.  **Docker**: installed in your local environment. You can find information in the following document https://docs.docker.com/get-docker/
2.  **IoT Edge Port**: At least one IoT Edge with Port 8181 and 5000 is opended and is connected to your Iot Hub. please follow this documentation for deployment information https://docs.microsoft.com/en-us/azure/iot-edge/quickstart-linux
3.  **Azure Custom Vision account**, see the below link to find your training key here https://www.customvision.ai/projects#/settings
4.  **Azure Container Registry**, please follow the document to create one https://docs.microsoft.com/en-us/azure/container-registry/
5.  **Azure Media Service**, please follow the document to create one https://docs.microsoft.com/en-us/azure/media-services/latest/create-account-howto?tabs=portal
6.  **Visual Studio Code**: IoT Edge development environment. [Download it from here](https://code.visualstudio.com/).
7.  **Visual Studio Code: Azure IoT Edge Extension**: An extension that connects to your IoT Hub and lets you manage your IoT Devices and IoT Edge Devices right from VS Code. A must-have for IoT Edge development. [Download it from here](https://marketplace.visualstudio.com/items?itemName=vsciot-vscode.azure-iot-edge). Once installed, connect it to your IoT Hub.

To learn more about this development environment, check out [this tutorial](https://docs.microsoft.com/en-us/azure/iot-edge/how-to-deploy-modules-vscode) and [this video](https://www.youtube.com/watch?v=C5eTQ1cwlLk&t=1s&index=35&list=PLlrxD0HtieHh5_pOv-6xsMxS3URD6XD52):

[![Visual Studio Code Extension Video](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/VSCodeExtensionVideo.png)](https://www.youtube.com/watch?v=C5eTQ1cwlLk&t=1s&index=35&list=PLlrxD0HtieHh5_pOv-6xsMxS3URD6XD52)

### Get Started

- Clone yadavm_factoryai_lpr branch

  ```bash
  git clone https://github.com/Azure-Samples/azure-intelligent-edge-patterns.git --single-branch --branch yadavm_factoryai_lpr
  ```

- Go to factoryai directory and open your vscode

  ```bash
  cd azure-intelligent-edge-patterns/factory-ai-vision
  ```

- Edit the `env-template` file, you should see something like this

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

- Please fill in your credentials and rename it as `.env`, vscode will use this file to set the environment variables

- Choose a deployement template that suites your Edge device.

  - For Azure Stack Edge =>
    `deployment.ase.gpu.template.json`
  - For x86 device with CPU =>
    `deployment.cpu.template.json`
  - For x86 device with CPU =>
    `deployment.gpu.template.json`
  - using an arm64v8 device with CPU =>
    `deployment.cpu.arm64v8.template.json`
  - using an arm64v8 device with GPU =>
    `deployment.gpu.arm64v8.template.json`

  In this instruction, we take `deployment.gpu.template.json` for instance.

- Find `deployment.gpu.template.json` under `EdgeSolution` directory in vscode, right click on it, choose "Build and Push Iot Edge Solution". It'll start to build the container, you should expect to wait for more than 10 mins if it's the first time you build the container.

- Find `deployment.gpu.amd64.json` under `EdgeSolution/config` directory in vscode, right click on it, choose "Create Deployment to Single Device", select your device to deploy, you should expect the edge will pull the container for more than 10 mins if it's the first time.

- Go to your device (via ssh), use `docker ps` to check whether all the modules are pulled and running. You should see 6 modules running including:

  a. webmodule

  b. inferencemodule

  c. rtspsimmodule

  d. webdbmodule

  e. azureiotedge-hub

  f. azureiotedge-agent

- Please wait until all 6 are running. Open your browser and connect [http://YOUR_IP:8181](http://YOUR_IP:8181)

### Video Tutorial

- Getting started with VS code [https://youtu.be/ORTwMYOxkVs]

# Privacy Notice

The software may collect information about your use of the software and send it to Microsoft.
Microsoft may use this information to provide services and improve our products and services.
You may turn off the telemetry as described in the repository or clicking settings on top right
corner. Our privacy statement is located at [https://go.microsoft.com/fwlink/?LinkID=824704](https://go.microsoft.com/fwlink/?LinkID=824704)
. You can learn more about data collection and use in the help documentation and our privacy
statement. Your use of the software operates as your consent to these practices.

# Troubleshooting

If you are running into issues, please check following for assistnat:

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

   If you don’t see above, the conatiners aren't downloaded successfully yet

3. If the inference & visionweb modules exist but still cannot see the page in 8181 port, check whether 8181 port on your edge is opened.
4. If you can visit the website (in 8181 port) but not see the inference result video after clicking configuration in the Part Identification page, please check whether your edge's 5000 port is opened.

# Custom vision + Azure IoT Edge for Factory AI
This is a sample showing how to deploy a Custom Vision model to Azure IoT edge device and get AI model up running in a single day. 
Custom Vision equipped with image classification and object detection that are trained in the cloud with your own images. You can define your location, camera and set up objects to detect any manufacturing parts, defeat area, etc. while keeping your vide footage private, lowering your badnwidth costs and even running offline. 
Check out [this video](https://channel9.msdn.com/Events/Build/2020/BOD131) to see brief introduction in action and understand how the value is delievered: 
[![video](https://mediusprodstatic.studios.ms/video-28874/thumbnail.jpg?sv=2018-03-28&sr=c&sig=svseIEcORPXo2vyKdEbzetamD9qDI3gXgzKhlTbIHUM%3D&se=2025-05-15T13%3A06%3A01Z&sp=r)](https://channel9.msdn.com/Events/Build/2020/BOD131)



# Prerequiste
## Hardware
-	**Azure Stack Edge**
- **Simulated Azure IoT Edge device** (such as a PC): Set up Azure IoT Edge ([instructions on Windows](https://docs.microsoft.com/en-us/azure/iot-edge/how-to-install-iot-edge-windows-with-linux), [instructions on Linux](https://docs.microsoft.com/en-us/azure/iot-edge/how-to-install-iot-edge-linux)) and use the amd64 tags. A test x64 deployment manifest is already available.
     * For runing on CPU : A x64 ubuntu machine with docker + Azure Iot edge working
     * For runnign on GPU : Azure Stack Edge OR Azure/Azure Stack Hub NCv2 VM with Nvidia Docker + Nvidia driver + Azure Iot Edge
## Services
Check out the architecture below to see how Vision on Edge works. You can also get more details through this tutorial to see how a IoT Edge deployment works. You must have the following services set up to use this solution:

 
## Get Started 
To install the Vision on Edge Solution Accelerator, the following prerequisites are required...
  1.	You must have the Azure CLI installed on your system. See ([this document](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest) for information on how to install the CLI
  2.	You must have an Azure subscription
  3.	That subscription must contain an IoT Hub with a registered IoT Edge device (generally this will be an Azure Stack Edge Device), port 5000 and 8080 need to be opened in the IoT Edge device/vm
  4.	If you choose to deploy a new instance of Custom Vision service, this installer will try to install the free version. If you have an existing free version, install will fail.

# Vision on Edge Installer
## Option 1: Installation with Installer:

### Prerequisites
To install the solution on a PC running Windows, unpack the installation zip, navigate to the directory containing the unziped files in a terminal, and run the factory-ai-vision-install.cmd script.

To install the solution on a Mac, or a PC running Linux, unpack the installation zip, navigate to the directory containing the unziped files in a terminal, and run the factory-ai-vision-install.sh script.

Before installation, please make sure you have the following: 
   1.	At least one IoT Edge with Port 8080 and 5000 is opended and is connected to your Iot Hub. please follow this documentation for deployment information  https://docs.microsoft.com/en-us/azure/iot-edge/quickstart-linux 
   2.	Azure Custom Vision account, see the below link to find your training key ([here]https://www.customvision.ai/projects#/settings)
### Get Started:
Go to factory-ai-vision repo and click on Installers folder, there are two zip files, Windows.zip and bash.zip 

For Windows: 
   1.	Click and download the Windows.zip, and unzip the zipped files. It contains three files:
   a. deploy-custom-vision-arm.json
   b. deployment.amd64.json 
   c. factory-ai-vision-install.cmd
   2.	Open the factory-ai-vision-install.cmd file and start running the installation. 
      It will open the terminal windows and ask for your Azure subscription. 
   3.	Choose your subscription
   4.	Choose whether if you are using existing Custom Vision service or creating a new one. Then input your endpoint and key information. 
   5.	Choose where is your targeted edge device and confirm whether your device (GPU or CPU) 

For Mac:
   1.	Open terminal 
   2.	Location the file, unzip bash.zip
   3.	excute ```bash factory-ai-vision-install.sh```
   4.	It will direct you to azure subscription login page
   5.	Choose your subscription 
   6.	Choose whether if you are using existing Custom Vision service or creating a new one. Then input your endpoint and key information. 
   7.	Choose where is your targeted edge device and confirm whether your device (GPU or CPU) 

## Option 2: Install with vs code

### Prerequisites

Before installation, You must have the following services set up to use Vision on Edge:
   1.	**Docker**: installed in your local environment. You can find information in the following document https://docs.docker.com/get-docker/
   2.	**IoT Edge Port**: At least one IoT Edge with Port 8080 and 5000 is opended and is connected to your Iot Hub. please follow this documentation for deployment information  https://docs.microsoft.com/en-us/azure/iot-edge/quickstart-linux 
   3.	**Azure Custom Vision account**, see the below link to find your training key here https://www.customvision.ai/projects#/settings
   4.	**Azure Container Registry**, please follow the document to create one https://docs.microsoft.com/en-us/azure/container-registry/
   5.	**Visual Studio Code**: IoT Edge development environment. [Download it from here](https://code.visualstudio.com/).
   6. **Visual Studio Code: Azure IoT Edge Extension**: An extension that connects to your IoT Hub and lets you manage your IoT Devices and IoT Edge Devices right from VS Code. A must-have for IoT Edge development. [Download it from here](https://marketplace.visualstudio.com/items?itemName=vsciot-vscode.azure-iot-edge). Once installed, connect it to your IoT Hub.
 
To learn more about this development environment, check out [this tutorial](https://docs.microsoft.com/en-us/azure/iot-edge/how-to-deploy-modules-vscode) 

### Get Started:

1. create a `.env` file under directory ```factory-ai-vision/EdgeSolution``` and put following Azure Container Registry credential in. Your Visual Studio Code will need these credential to push the container later.
 CONTAINER_REGISTRY_NAME="<YOUR_CONTAINER_REGISTRY_NAME>"
 CONTAINER_REGISTRY_USERNAME="<YOUR_CONTAINER_REGSITRY_USERNAME>"
 CONTAINER_REGISTRY_PASSWORD="<YOUR_CONTAINER_REGISTRY_PASSWORD>"
2. (optional) Enter your custom vision training key TRAINING_KEY and endpoint ENDPOINT in `factory-ai-vision/EdgeSolution/modules/WebModule/backend/config.py.` Copy the information from your custom vision setting page. If you skip this step here, you are require to input the information later once the deployment are completed.
3. Open Visual Studio Code, to build the GPU version, right click on ```factory-ai-vision/EdgeSolution/deployment.gpu.template.json``` and choose "Build and Push IoT Edge Solution" it will start building the docker container. For the first time deployment, It takes more than 10 mins to complete. 
    For CPU version, use the template file ```factory-ai-vision/EdgeSolution/deployment.gpu.template.json``` instead.
4. In Visual Studio Code, right click on ```factory-ai-vision/EdgeSolution/config/deployment.gpu.amd64.json (or factory-ai-vision/EdgeSolution/config/deployment.cpu.amd64.json```if you built CPU version in the last step) and choose "Create Single Deployment for Single Device" and select the edge device from the list to deploy.
5. Open your browser and connect to ```http://<your-edge-ip:8080>.``` In this step you will be asked to input your Custom Vision Training Key & Endpoint If you skiped step2 above.

# Video Tutorial 

- Vision on Edge installer: https://youtu.be/NWKLk8ENo-g
- Test with pretrained mode: https://youtu.be/7PWGNC7rkCE
- Start from scratch- setup camera, add parts, label and train: https://youtu.be/jLY-VkxU99U
- Retrain the model: https://youtu.be/dXh9isASvcY
- Load project from Custom Vision: https://youtu.be/gTEWlu2V8yk


# Troubleshooting 
If you are running into issues, please check following for assistnat:

1. Ensure your setup is good
    1. On CPU make sure this work: https://azuremarketplace.microsoft.com/en-us/marketplace/apps/azure-iot.simulated-temperature-sensor?tab=Overview
    2. On GPU make sure this work:
        1. Quick test : run below command this will try to access nvidia gpu inside docker
            - ```sudo docker run --runtime=nvidia --rm nvidia/cuda nvidia-smi``` 
        2. Long test :: deploy below from marketplace on your iot edge device and make sure it works 
           https://azuremarketplace.microsoft.com/en-us/marketplace/apps/intelligent-edge.gpureferencemodule?tab=Overview
2. If this is the first time you deploy the container to your edge, you might need to wait for more than 10 mins. You can use ssh to connect to your edge and try sudo docker ps., then you should see following 2 containers running:
YOUR_CONTAINER_REGISTRY_NAME/inferencemodule:x.x.xx-cpuamd64 (or gpu)
YOUR_CONTAINER_REGISTRY_NAME/visionwebmodule:x.x.xx-cpuamd64

   If you don’t see above, the conatiners aren't downloaded successfully yet

3. If the inference & visionweb modules exist but still cannot see the page in 8080 port, check whether 8080 port on your edge is opened.
4. If you can visit the website (in 8080 port) but not see the inference result video after clicking configuration in the Part Identification page, please check whether your edge's 5000 port is opened



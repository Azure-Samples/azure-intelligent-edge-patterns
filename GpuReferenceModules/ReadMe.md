# Deploy a GPU enabled IoT Module on Azure Stack Hub
## About this sample
### Overview
In this article you'll learn how to:
  - Deploy a GPU module to an IoT Edge VM on Azure Stack Hub
  - Benchmark processing times for GPUs and CPUs

### Included Models
This sample includes PyTorch and TensorFlow benchmarking sample code for CPU against GPU

## How to run this sample
### Prerequisites
Before you begin, make sure you have:
  - A tenant subscription Azure Stack Integrated System or Azure Stack Development Kit
  - A Linux virtual machine with IoT Edge set up and associated to an IoT Hub. For more information, go to [Install the Azure IoT Edge runtime on Debian-based Linux systems](https://docs.microsoft.com/en-us/azure/iot-edge/how-to-install-iot-edge-linux).

  - An Azure subscription
      - If you don't have an Azure subscription, create a free account
        before you begin
      - An Azure Container Registry (ACR)
          - **Make a note of the ACR login server, username, and
            password**
  - A camera that presents an HTTP or RTSP endpoint for getting images.
  - The following development resources:
      - Azure CLI 2.0   
      - Docker CE 
      - Visual Studio Code  
      - Azure IoT Tools for Visual Studio Code    
      - Python extension for Visual Studio Code    
      - Python    
      - Pip for installing Python packages (typically included with your
        Python installation)

## Get the Code

1.  Clone or download the code.
```
  git clone https://github.com/garvitarai/gpu-testing/tree/yadavmchanges/GpuReferenceModules
```
## Configure and Build Containers
1.  Open the “GpuReferenceModules” folder in Visual Studio Code.
2.  Fill in the values in the .env.template file for your ACR.
```
        REGISTRY_NAME=<YourAcrUri>
        REGISTRY_USER_NAME=<YourAcrUserName>
        REGISTRY_PASSWORD=<YourAcrPassword>
```
3.  Rename the file to ".env".
4.  Sign into Docker by entering the following command in the Visual
    Studio Code integrated terminal. Use the username, password, and login
    server that you copied from your Azure container registry in the
    first section. You can also retrieve these values from the Access
    Keys section of your registry in the Azure portal.  
```
      docker login -u <REGISTRY_USER_NAME> -p <REGISTRY_PASSWORD> <REGISTRY_NAME>.azurecr.io
```
5.  In the VS Code explorer, right-click the deployment.iotedgevm.template.json
    file and select Build and Push IoT Edge solution.

## Setup Monitoring 

1.  Download Azure IoT Explorer, and connect the application to your IoT Hub.

2.  Select your IoT Device and navigate to Telemetry from the navigation menu.

3. Press Start to begin monitoring output from the IoT Edge Device.

## Deploy to Azure Stack

You can also deploy modules using the Azure IoT Hub Toolkit extension
(formerly Azure IoT Toolkit extension) for Visual Studio Code. You
already have a deployment manifest prepared for your scenario, the
deployment.json file. All you need to do now is select a device to
receive the deployment.

1.  In the VS Code command palette, run Azure IoT Hub: Select IoT Hub.

2.  Choose the subscription and IoT hub that contain the IoT Edge device
    that you want to configure.

3.  In the VS Code explorer, expand the Azure IoT Hub Devices section.

4.  Right-click the name of your IoT Edge device, then select Create
    Deployment for Single Device.

5.  Select the `deployment.amd64.json` file in the config folder and then click
    Select Edge Deployment Manifest. Do not use the
    `deployment.template.json` file.

6.  Click the refresh button. You should see GPUModule running.

# Next Steps

  - Learn more about Azure Stack, Data Box Edge and the Intelligent Edge, at [aka.ms/intelligentedge](https://aka.ms/intelligentedge)

  - Learn more about hybrid cloud applications, see [Hybrid Cloud
    Solutions](https://aka.ms/azsdevtutorials)

  - Modify the code to this sample on
    [GitHub](https://github.com/Azure-Samples/azure-intelligent-edge-patterns).
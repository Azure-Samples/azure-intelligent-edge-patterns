# Azure Stack

In this article you'll learn how to:
  - Deploy a set of modules to an IoT Edge VM on Azure Stack
  - Set up an application that uses Azure Stack for rapid inference at
    the edge.

## Architecture

![](edgeai-media/media/azurestack.png)

## How to run this sample
### Prerequisites
Before you begin, make sure you have:
  - A tenant subscription Azure Stack Integrated System or Azure Stack Development Kit
  - A Linux virtual machine with IoT Edge set up and associated to an IoT Hub. For more information, go to [Install the Azure IoT Edge runtime on Debian-based Linux systems](https://docs.microsoft.com/en-us/azure/iot-edge/how-to-install-iot-edge-linux).

  - An Azure subscription
      - If you don't have an Azure subscription, create a free account
        before you begin.
      - An Azure Container Registry (ACR).
          - **Make a note of the ACR login server, username, and
            password.**
  - A camera that presents an HTTP or RTSP endpoint for getting images.
  - The following development resources:
      - Azure CLI 2.0    
      - Docker CE.    
      - Visual Studio Code.    
      - Azure IoT Tools for Visual Studio Code.    
      - Python extension for Visual Studio Code.    
      - Python    
      - Pip for installing Python packages (typically included with your
        Python installation).

## Prepare the IoT Edge VM

1.  Make a note of the virtual machine's IP address.
2.  Create a folder on the IoT Edge VM for images from the camera.

## Get the Code

1.  Clone or download the code.
```
  git clone https://github.com/azure-samples/azure-intelligent-edge-patterns
```
## Configure and Build Containers
1.  Open the “edge-ai-void-detection” folder in Visual Studio Code.
2.  Fill in the values in the .env.template file with your ACR credentials, 
	ACR registry name, URL
    for images, public IP address of the IoT Edge VM,
    and the name of the folder you created earlier.<br/>
3.  Rename the file to ".env".
4.  Sign into Docker by entering the following command in the Visual
    Studio Code integrated terminal. Push your module image to your
    Azure container registry. Use the username, password, and login
    server that you copied from your Azure container registry in the
    first section. You can also retrieve these values from the Access
    keys section of your registry in the Azure portal.    
`docker login -u 'ACR username' -p 'ACR password' 'ACR login
        server'`
5.  In the VS Code explorer, right-click the deployment.iotedgevm.template.json
    file and select Build and Push IoT Edge solution.

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

5.  Select the `deployment.iotedgevm.amd64.json` file in the config folder and then click
    Select Edge Deployment Manifest. Do not use the
    `deployment.iotedgevm.template.json` file.

6.  Click the refresh button. You should see \[modules running\]

## Test Your Solution

1.  Go to the viewer app and watch images with voids appear.
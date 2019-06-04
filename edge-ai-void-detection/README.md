# Deploy an Edge-based Machine Learning Solution
## About this sample
### Overview
This sample will help you deploy a solution that does rapid
inferencing on an Azure Data Box Edge.

In this article you learn how to:
  - Deploy a set of modules to a Data Box Edge
  - Use the integrated FPGA on a Data Box Edge.
  - Set up an application that uses Data Box Edge for rapid inference at
    the edge.

### Architecture
![](/edgeai-media/media/image1.png)

## How to run this sample
### Prerequisites
Before you begin, make sure you have:
  - A Data Box Edge that is running
      - The device also has an associated IoT Hub resource.
      - The device has Edge compute role configured. For more
        information, go to [<span class="underline">Configure
        compute</span>](https://docs.microsoft.com/en-us/azure/databox-online/data-box-edge-deploy-configure-compute#configure-compute) for
        your Data Box Edge.
      - Ensure that the Data Box Edge can run Project Brainwave
        workloads.

  - An Azure subscription
      - If you don't have an Azure subscription, create a free account
        before you begin.
      - An Azure Container Registry (ACR).
          - **Make a note of the ACR login server, username, and
            password.**
  - A camera that presents an HTTP endpoint for getting images.
  - The following development resources:
      - Azure CLI 2.0    
      - Docker CE.    
      - Visual Studio Code.    
      - Azure IoT Tools for Visual Studio Code.    
      - Python extension for Visual Studio Code.    
      - Python    
      - Pip for installing Python packages (typically included with your
        Python installation).

### Prepare the Data Box Edge

1.  Make sure that the Data Box Edge has the compute role enabled. Make
    a note of the compute role’s IP address.
2.  Create a local-only share on the Data Box Edge. Make a note of its
    name.

### Get the Code

1.  Clone or download the code.
```
  git clone https://github.com/azure-samples/azure-intelligent-edge-patterns
```
### Configure and Build Containers
1.  Open the “edge-ai-void-detection” folder in Visual Studio Code.
2.  Fill in the values in the .env.template file with your ACR credentials, URL
    for images, external IP address of the Data Box Edge compute role,
    and the name of the share you created earlier.
3.  Rename the file to ".env".
4.  Sign into Docker by entering the following command in the Visual
    Studio Code integrated terminal. Push your module image to your
    Azure container registry. Use the username, password, and login
    server that you copied from your Azure container registry in the
    first section. You can also retrieve these values from the Access
    keys section of your registry in the Azure portal.    
`docker login -u 'ACR username' -p 'ACR password' 'ACR login
        server'`
5.  In the VS Code explorer, right-click the deployment.template.json
    file and select Build and Push IoT Edge solution.

### Deploy to Data Box Edge

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

5.  Select the deployment.amd64 file in the config folder and then click
    Select Edge Deployment Manifest. Do not use the
    deployment.template.json file.

6.  Click the refresh button. You should see \[modules running\]

### Test Your Solution

1.  Go to the viewer app and watch images with voids appear.

2.  Check the share on the Data Box Edge and watch raw images appear.

# Next Steps

  - Learn more about Data Box Edge and the Intelligent Edge, see

  - Learn more about hybrid cloud applications, see [Hybrid Cloud
    Solutions](https://aka.ms/azsdevtutorials)

  - Modify the code to this sample on
    [GitHub](https://github.com/Azure-Samples/azure-intelligent-edge-patterns).

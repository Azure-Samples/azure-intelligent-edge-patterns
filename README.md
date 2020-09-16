---
page_type: sample
languages:
- csharp
- javascript
- python
- powershell
products:
- azure
description: "These samples demonstrate how to quickly get started developing for the Azure Intelligent Edge, using the Azure Stack Edge and Azure Stack Hub. Each sample is self-contained and may require extra hardware."
urlFragment: azure-intelligent-edge-patterns
---

# Azure Intelligent Edge Patterns

These samples demonstrate how to quickly get started developing for the Azure Intelligent Edge, using the Azure Stack Edge and Azure Stack Hub. Each sample is self-contained and may require extra hardware.

## List of Samples
- Deploy an Edge-based Machine Learning solution
- Deploy a Footfall Analysis solution
- Deploy a Staged Data Analytics Solution
- Deploy a SQL Server 2016 Enterprise Availability Group on 2 Azure Stacks
- Deploy a Highly Available MongoDB Replica Set on 2 Azure Stacks

## Resources
  - Learn more about hybrid cloud applications, see [Hybrid Cloud
    Solutions.](https://azure.microsoft.com/en-us/solutions/hybrid-cloud-app/)
  - Learn more about Azure Stack Hub, see [Azure Stack Hub](https://azure.microsoft.com/en-us/overview/azure-stack/)
  - Learn more about Azure Stack Edge, see [Azure Stack Edge](https://azure.microsoft.com/en-us/services/databox/edge/)

# New Version Build From Source

### Prerequisite
- An active Azure subscription
- Azure resources deployed in the Azure subscription
    
    a. Azure IoT Hub
    
    b. Azure Media Services
    
    c. Azure container registry

- A GPU Linux edge device with IoT Edge runtime (with port 8080 and 5000 opened)
- [Visual Studio](https://code.visualstudio.com/) Code on your development machine with following extensions
    
    a. [Azure IoT Tools](https://marketplace.visualstudio.com/items?itemName=vsciot-vscode.azure-iot-tools)
    
    b. [Python](https://marketplace.visualstudio.com/items?itemName=ms-python.python)

- [Docker](https://docs.docker.com/engine/install/) on your development machine

### Get the source code
- Clone yadavm_factoryai_lpr branch 
    
    git clone https://github.com/Azure-Samples/azure-intelligent-edge-patterns.git --single-branch --branch yadavm_factoryai_lpr
    
- Go to factoryai directory and open your vscode

    cd azure-intelligent-edge-patterns/factory-ai-vision
    
- Edit the ```env-template``` file, you should see something like this
```
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

- Find ```deployment.gpu.template.json``` under ```EdgeSolution``` direcotyr in vscode, right click on it, choose "Build and Push Iot Edge Solution". It'll start to build the container, you should expect to wait for more than 10 mins if it's the first time you build the container.

- Find  ```deployment.gpu.amd64.json``` under ```EdgeSolution/config``` directory in vscode, right click on it, choose "Create Deployment to Single Device", select your device to deploy, you should expect the edge will pull the container for more than 10 mins if it's the first time.

- Go to your device (via ssh), use `docker ps` to check whether all the modules are pulled and running. You should see 6 modules running including:

    a. visionwebmodule
    
    b. inferencemodule
    
    c. rtspsimmodule
    
    d. webdbmodule
    
    e. azureiotedge-hub
    
    f. azureiotedge-agent
    
- Please wait until all 6 are running. Open your browser and connect http://YOUR_IP:8080

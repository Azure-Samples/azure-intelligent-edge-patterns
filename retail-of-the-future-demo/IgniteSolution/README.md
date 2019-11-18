<!-- TOC -->

- [Ignite Containers Deployment Guide](#ignite-containers-deployment-guide)
  - [Prerequisites](#prerequisites)
    - [Visual Studio Code](#visual-studio-code)
    - [Create Anaconda Environment](#create-anaconda-environment)
    - [Configure IoT Hub connection in VS Code](#configure-iot-hub-connection-in-vs-code)
    - [Deploying to IoT Edge](#deploying-to-iot-edge)
    - [Further Information and Troubleshooting](#further-information-and-troubleshooting)

<!-- /TOC -->

# Ignite Containers Deployment Guide

## Prerequisites

### Visual Studio Code

1. Install [Visual Studio Code](https://code.visualstudio.com/)
1. Install [Azure IoT Tools](https://marketplace.visualstudio.com/items?itemName=vsciot-vscode.azure-iot-tools) extension

**Note:** You don't need to install iothubdev, docker, etc. They are not required for deployment. [VS Code and IoT Edge](https://docs.microsoft.com/en-us/azure/iot-edge/how-to-vs-code-develop-module) for more info

![extensions](docs/images/ext.png)

### Create Anaconda Environment

1. Install [Anaconda distribution](https://www.anaconda.com/distribution/)
1. Install [CMake](https://cmake.org/download/)

1. Create Anaconda environment from `environment_prod.yml` in this folder. This will install `opencv`, build `dlib` (takes a while, requires CMake), and other prerequisites.

    ```sh
    conda create -f environment_prod.yml
    conda activate ignite
    ```
Running: 
```sh
pythyon people-counting\people_counter.py <args>
```

### Configure IoT Hub connection in VS Code

1. Clone this repo.
1. Load `IgniteSolution` (the folder containing this README) into VS Code
1. Expand Azure IOT Hub view at the very bottom of the **Files** tab in VS Code

![](docs/images/iothub.png)

2. Pick "Select IoT Hub" from the "..." menu, go through the prompts and select `iothub-235un`

You are now ready to deploy the demo backend on our edge devices


### Deploying to IoT Edge

1. Obtain the [.env](https://nacollab.sharepoint.com/sites/MicrosoftIgniteRetailDemo/Shared%20Documents/General/Dev%20Docs/.env) file and place it at the root of this solution. This file contains expansions to the variables mentioned in the deployment template.

1. Generate Deployment manifest. This will generate a `deployment.remote.amd64.json` in the `config` directory:

![](docs/images/generate.png)

2. Deploy to the right device by selecting the file generated in the previous step. **NOTE**: Do not right-click on the "template" file:

![](docs/images/deploy.png)

![](docs/images/select_device.png)

You are done!

### Further Information and Troubleshooting

Follow the [Counters and Gap Detection](docs/counters_and_gap_detection.md) guide for detailed information on calibrating counters and enabling gap detection.
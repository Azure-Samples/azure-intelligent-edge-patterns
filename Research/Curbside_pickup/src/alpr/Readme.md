# ALPR LVA AI Module Project

## Prerequisites

- A local registry set up (recommended for dev and debug cycles)
- Docker CE (IMPORTANT:  NOT Moby)
- Nvidia docker
- IoT Edge runtime
- NVIDIA GPU w/ drivers on host machine/edge device
- CUDA and cuDNN on host machine/edge device

To get cuDNN
- Go to NVIDIA website and sign up for Developer program
- Download cuDNN

---
Workaround may be for "not moby":
- Use IoT Edge Runtime RC1
- desiredProperties will change

## Components

- Scoring script
- Pieces to make Flask app run with gunicorn
- ALPR libraries
- Dockerfile with components above for AI image

## LVA Steps

- Set up cloud resources.

    bash -c "$(curl -sL https://aka.ms/SetupLvaResources)"

- Git clone `https://github.com/Azure/live-video-analytics.git`

- Replace (utilizing guide given by LVA team)
    - `operations.json`
    - `topology-httpextension.json`
    - `appsettings.json`

- Create manifest and deploy to single device with `deployment.lpr.template.json`
- Create IoT Hub
- Under IoT Hub create Egde Device

## General Steps

Recommended path:  Jupyter notebooks from `notebooks` directory (may need some file path modifications)

- Modify scoring script, `score.py`, for new purposes (using Jupyter notebook or editor)
- Make a `models` folder within `src/alpr/lva_ai_solution/` folder and place `detector.pth` and `recognizer.pth` within it.
- Within `src/alpr/lva_ai_solution/` create a `.env` file with the following filled in:

```
azureSubsctiptionId=""
resourceLocation=""
resourceGroupName=""
containerRegServiceName=""
iotHubServiceName=""
mlSolutionPath=""
containerImageName=""
iotDeviceId=""
localContainerRegServiceName=""
acrUserName=""
acrPassword=""
acrServer=""
iotEdgeDeviceConnString=""
storageConnStr=""
```

- Build from `Dockerfile` w/ new tag from ML solution (`lva_ai_solution`) directory, e.g.,

    docker build -t mhregistry:55000/mhlva01aimodule:v0.0.11 -f Dockerfile .

- Push image to local registry or ACR (whichever using), e.g.,

    docker push mhregistry:55000/mhlva01aimodule:v0.0.3

- Reset modules on edge device with manifest with Azure CLI, e.g.,

    az iot edge set-modules --device-id $iotDeviceId --hub-name $iotHubServiceName --content "LVAResetDeviceTemplate.json"

- Deploy private preview LVA + AI modules with deployment manifest with Azure CLI, e.g.,

    az iot edge set-modules --device-id $iotDeviceId --hub-name $iotHubServiceName --content "LVADeployment.json"

## Run app

- Install dotnet Core 3.1:   https://dotnet.microsoft.com/download/dotnet-core/3.1
- Git clone `https://github.com/Azure-Samples/live-video-analytics-iot-edge-csharp`
- Change to directory:  `cd src/cloud-to-device-console-app/`

## Caveats

- Must use PyTorch 1.2 or less due to hardware compatibility restrictions
- The Storage connection string is in the container such that anyone with access to Edge device could get to it (LVA integration w/ storage via direct methods should be the production methodology)
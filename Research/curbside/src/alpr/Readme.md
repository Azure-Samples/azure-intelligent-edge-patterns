# ALPR LVA AI Module Project

## Prerequisites

- A local registry set up (recommended for dev and debug cycles)
- Docker CE
- Nvidia docker
- IoT Edge runtime
- NVIDIA GPU w/ drivers on host machine/edge device
- CUDA and cuDNN on host machine/edge device

## Components

- Scoring script
- Pieces to make Flask app run with gunicorn
- ALPR libraries
- Dockerfile with components above for AI image

## LVA Steps

Follow directions [here](https://github.com/julialieberman/azure-intelligent-edge-patterns/tree/t-jull-lprsample/Research/lva-ase-lpr-sample)

## General Steps

Recommended path:  Jupyter notebooks from `notebooks` directory (may need some file path modifications)

- Modify scoring script, `score.py`, for new purposes (using Jupyter notebook or editor)
- Build from `Dockerfile` w/ new tag from ML solution directory, e.g.,

    docker build -t mhregistry:55000/mhlva01aimodule:v0.0.11 -f Dockerfile .

- Push image to local registry or ACR (whichever using), e.g.,

    docker push mhregistry:55000/mhlva01aimodule:v0.0.3

- Reset modules on edge device with manifest with Azure CLI, e.g.,

    az iot edge set-modules --device-id $iotDeviceId --hub-name $iotHubServiceName --content "LVAResetDeviceTemplate.json"

- Deploy private preview LVA + AI modules with deployment manifest with Azure CLI, e.g.,

    az iot edge set-modules --device-id $iotDeviceId --hub-name $iotHubServiceName --content "LVADeployment.json"


## Caveats

- Must use PyTorch 1.2 or less due to hardware compatibility restrictions
- The Storage connection string is in the container such that anyone with access to Edge device could get to it (LVA integration w/ storage via direct methods should be the production methodology)
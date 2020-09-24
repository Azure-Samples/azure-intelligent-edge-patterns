# Extended details on Building and Deploying

> Using VS Code, both with [Docker](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker) and [Azure IoT Tools](https://marketplace.visualstudio.com/items?itemName=vsciot-vscode.azure-iot-tools) extensions, will ease building and deploying, no matter the target device you use.

## First Steps

Recommended path:  Jupyter notebooks from `notebooks` directory (may need some file path modifications)

- Modify scoring script, `score.py`, for new purposes (using Jupyter notebook or editor)
- Make a `models` folder within `src/alpr/lva_ai_solution/` folder and place `detector.pth` and `recognizer.pth` within it.
- Within `src/alpr/lva_ai_solution/` create a `.env` file with the following properly replaced:

```
CONTAINER_REGISTRY_USERNAME_myacr="<replace-me>"
CONTAINER_REGISTRY_PASSWORD_myacr="<replace-me>"
SUBSCRIPTION_ID="<replace-me>"
RESOURCE_GROUP="<replace-me>"
AMS_ACCOUNT="<replace-me>"
AAD_TENANT_ID="<replace-me>"
AAD_SERVICE_PRINCIPAL_ID="<replace-me>"
AAD_SERVICE_PRINCIPAL_SECRET="<replace-me>"
INPUT_VIDEO_FOLDER_ON_DEVICE="<replace-me>"
OUTPUT_VIDEO_FOLDER_ON_DEVICE="<replace-me>"
APPDATA_FOLDER_ON_DEVICE="<replace-me>"
```

## Building LPR Container

- Build from `Dockerfile` with new tag from ML solution (`lva_ai_solution`) directory, e.g.,

    `docker build -t lpr:v.1.1 -f Dockerfile .` (may require `sudo` upfront depending on your setup)

- Tag and Push image to your registry, e.g. (using Azure Container Registry),

    `docker tag lpr:v.1.1 <youracrusername>.azurecr.io/lpr:v.1.1`
    `docker push <youracrusername>.azurecr.io/lpr:v1.1`

## Deploying to IoT Edge Device

Depending the operations schema, you may end up using an IoT Edge Device, that sits on a) a Server (we'll call it VM for short), or into an Azure Stack Edge device (ASE). There're subtle differences into each.

> Be it a VM or ASE, make sure you're reflecting your newly pushed `image:` under "lpraimodule".

### VM based IoT Edge Device
Template: `src/alpr/deployment.lpr.vm.template.json`

* Make sure folders mapped as Binds, exist on the host VM.
    * input
    * output
    * appdata

    i.e. create a top folder in `/var/iotedgedata` with `mkdir` command. In there add the 3 folders (assuming `cd /var/iotedgedata`):
    `mkdir input`
    `mkdir output`
    `mkdir appdata`

* Then, assign permissions to it and all the subdirectories created (i.e. `chmod -R ug+rw /var/iotedgedata`)

* To deploy the template into target IoT Edge Device, point your Azure IoT Hub to the one where the IoT Edge Device is configured (here's some [help](https://github.com/Microsoft/vscode-azure-iot-toolkit/wiki). Then, follow these steps.
    
    1. Right click on your template (from VS Code) and select "Generate IoT Edge Deployment Manifest"
    ![screenshot](assets/generate-deployment-manifest.png)
    2. If all goes fine, you'll see a notification. Now click on your template (from VS Code) and select "Generate IoT Edge Deployment Manifest"
    ![screenshot](assets/deploy-for-single-device.png)


### ASE based IoT Edge Device
Template: `src/alpr/deployment.lpr.ase.template.json`

* Make sure your shares are in place for `output`, `input` and `appdata`
[TODO: more-details-here]

* To deploy the template into target IoT Edge Device, point your Azure IoT Hub to the one where the IoT Edge Device is configured (here's some [help](https://github.com/Microsoft/vscode-azure-iot-toolkit/wiki). Then, follow these steps.
    
    1. Right click on your template (from VS Code) and select "Generate IoT Edge Deployment Manifest"
    ![screenshot](assets/generate-deployment-manifest.png)
    2. If all goes fine, you'll see a notification. Now click on your template (from VS Code) and select "Generate IoT Edge Deployment Manifest"
    ![screenshot](assets/deploy-for-single-device.png)
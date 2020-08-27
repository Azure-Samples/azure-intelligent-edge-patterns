# Live Video Analytics License Plate Recognition Sample

This directory contains all the necessary files and instructions to run a license plate recognition sample on the Azure Stack Edge, using Live Video Analytics. This uses two Microsoft internal PyTorch models, one to do license plate detection and one to do license plate recognition (OCR). They were built by an intern in MSR Asia.

This sample is for internal use only, until the models can be made public. The code for the model itself is not included in this sample, but we will be pulling it's docker image from Mahesh's Azure Container Registry (ACR). In order to run this sample, you will need the username and password for his ACR __containerregistry12345__

## Contents

| File/folder             | Description                                                   |
|-------------------------|---------------------------------------------------------------|
| `lprtestvideo.mkv`| Sample video to run license plate model on.                                                 |
| `sample-lpr-topology.json`            | Media Graph topology file for lpr sample.                        |
| `README.md`             | This README file.                                             |
| `.gitignore`             | Files to ignore.                                             |
| `sampleoperations.json`       | JSON file defining the sequence of direct methods to invoke.  |
| `sampledeployment.lpr.template.json`            | The deployment manifest template to deploy this sample to your Azure Stack Edge device                                         |

## Setup instructions

### Prerequisites

* You should have followed the [instructions](https://github.com/julialieberman/azure-intelligent-edge-patterns/blob/t-jull-lvasample/Research/lva-ase-sample/README.md) and successfully run the YoloV3 sample using live video analytics on the Azure Stack Edge
* This means you should have the following resources in your resource group
	* ASE device linked to your IoT Hub
	* IoT Hub
	* Storage account
	* Azure Media Services
	* Streaming endpoint
	* Container Registry
* You should see output from the Azure IoT Hub when you run the YoloV3 sample, and see the corresponding videos in your output video folder
* You will need to ask Mahesh for the password to his ACR. Without this, you will not be able to pull the required container image for the AI module

If you have done the above correctly, this sample should take ~30 minutes. The hefty part of this is waiting for your device to finish downloading the Docker image containing the license plate detection and recognition. You will first run a script (or download content if working from VS Code), download the sample video, update your .env file, and then run the sample! 

### Option 1: run the script in the cloud ###
First thing you must do, is modify the .env file (found in lva-sample-on-ase/edge-deployment/.env) in the cloud. Change the following two variables to use Mahesh's registry (you must obtain
these values from Mahesh directly!):
* CONTAINER_REGISTRY_USERNAME_myacr=containerregistry12345
* CONTAINER_REGISTRY_PASSWORD_myacr= //@Mahesh

Hit Control+S to save. 

Assuming you are still inside your lva-sample-on-ase folder in the cloud shell, run the following commands
```
curl -X GET https://github.com/julialieberman/azure-intelligent-edge-patterns/blob/t-jull-lprsample/Research/lva-ase-lpr-sample/lprScript.sh > lprScript.sh
chmod +x lprScript.sh
./lprScript.sh
```
Monitor your deployment status in the Azure Portal (Go to your IotHub / Automatic Device Management / IoT Edge / Your device name)
After your deployment finishes (this can take up to 30 minutes!) run the command:
```
./invokeMethodsHelper.sh
```
Then you're done! 

Follow next steps directions [here](https://github.com/julialieberman/azure-intelligent-edge-patterns/blob/t-jull-lvasample/Research/lva-ase-sample/src/setup/readme.md#next-steps) if you'd like to learn more.

### Option 2: VS Code ###
## Copy three files into your local repository

You can choose to download these files from online or create the files yourself and copy paste their contents

* Put these two files in your src/edge folder. You can keep the old yolov3 template and topology, but you will not use them with this sample
    * __deployment.lpr.template.json__ 
    * __sample-lpr-topology.json__
* Put this file in your src/cloud-to-device-console-app folder
    * Replace your __operations.json__ file with the contents in sampleoperations.json file in this folder

## Download the sample video
* Download the lprtestvideo.mkv file and put it in your local share. This is meant to simulate a RTSP stream.

## Update your .env file
You will need to modify two values
* CONTAINER_REGISTRY_USERNAME_myacr=containerregistry12345
* CONTAINER_REGISTRY_PASSWORD_myacr= // @Mahesh

## Running the sample

The process here is identical to the one used to deploy the YoloV3 model. For reference, here are the steps:

* Right click on src/edge/deployment.lpr.template.json and select **“Generate Iot Edge deployment manifest”**. This will create an IoT Edge deployment manifest file in src/edge/config folder named deployment.yolov3.amd64.json.
* Right click on src/edge/config /deployment.yolov3.amd64.json and select **"Create Deployment for single device"** and select the name of your edge device. This will trigger the deployment of the IoT Edge modules to your Edge device. You can view the status of the deployment in the Azure IoT Hub extension (expand 'Devices' and then 'Modules' under your IoT Edge device).
    * This step will take ~6-10 minutes, and while it's loading your new module named 'lpraimodule' will have the status 'backoff'. This is fine! If this doesn't change when refreshing after 15 minutes, there may be an error. You will need to look into the module logs on your device.
* After the module shows the status 'running' right click on your edge device in Azure IoT Hub extension and select **"Start Monitoring Built-in Event Endpoint"**.
* Start a debugging session (hit F5). You will start seeing some messages printed in the TERMINAL window. In the OUTPUT window, you will see messages that are being sent to the IoT Hub by the Live Video Analytics on IoT Edge module. It will prompt you to hit enter a few times, but wait after you see "The topology will now be deactivated" if you want to let the module run for a few minutes.

You can see the images with bounding boxes and license plate strings in your local share from your file explorer. The video file will run in a continuous loop. You should see only 1-2 images in that folder. 

Go ahead and hit enter in the terminal when prompted until the program ends. If you wait a few minutes and run the program again, new images will be generated. 

Congratulations, you now have LPR and LVA running on the ASE!
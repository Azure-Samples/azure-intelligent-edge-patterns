# LIVE VIDEO ANALYTICS ON AZURE STACK EDGE SAMPLES

This repository contains instructions to run a sample that uses the Live Video Analytics on IoT Edge Module to analyze live video using a YoloV3 AI module, and record video on the Azure Stack Edge device

This tutorial will walk you through setting up an Azure Stack Edge device and deploying the following modules:
- Live Video Analytics
- RTSP simulation
- Yolo V3 AI model to detect objects

You can choose to set this up so the RTSP simulation videos are uploaded to the cloud or to your local files. This tutorial will set things up to run locally, but see instructions under [Next Steps](https://github.com/julialieberman/azure-intelligent-edge-patterns/blob/t-jull-lvasample/Research/lva-ase-sample/src/setup/readme.md) to change this.

## Contents ##

| File/folder       | Description                                |
|----------------------|--------------------------------------------|
| `src`                | Sample source code.                        |
| `.gitignore`         | Defines what to ignore at commit time.     |
| `README.md`          | This README file.                          |
| `camera-300s.mkv`    | The sample video to use as a simulated RTSP stream            |

The 'src' folder contains the setup subfolder with all necessary files to run this sample

## Prerequisites ##

1. An active Azure subscription with owner level permissions
2. Azure Stack Edge device

You will complete two phases to run through this entire sample. By the end, you will be running a YoloV3 object detection AI on the Azure Stack Edge with Live Video Analytics. 
Step 1: Setup the Azure Stack Edge
Step 2: Run script to deploy resources for Live Video Analytics and run the sample

## STEP 1: SETUP THE AZURE STACK EDGE (ASE) ##
Complete steps 1-4 of the [setup](https://docs.microsoft.com/en-us/azure/databox-online/azure-stack-edge-deploy-prep) for your Azure Stack Edge with the following notes in mind:
* The supported locations for Live Video Analytics as of July 2020 are canadaeast, centralus, eastus2, francecentral, japanwest, northcentralus, switzerlandnorth, uksouth, westcentralus, westus2, eastus2euap, and centraluseuap
* When you create a share you will point to the storage account you will use for this sample.
* Your share should be of type SMB and the Storage Service should be Block Blob. Feel free to create a new blob container and new user

Enable the compute network and [configure compute](https://docs.microsoft.com/en-us/azure/databox-online/azure-stack-edge-deploy-configure-compute). This will connect your IoT Hub with your ASE
* Before enabling compute from the Azure Portal, make sure to enable the network interface
* Provide at least three Kubernetes external service IPs in your local UI network settings when configuring compute (you need one per module) 

Now you will [add your local compute share](https://docs.microsoft.com/en-us/azure/databox-online/azure-stack-edge-deploy-configure-compute#add-shares) after configuring compute
* Make sure to select both "Use the share with Edge compute" and "Configure as Edge local share"
* Make your share type: SMB and Storage Service: Block Blob
* Use the existing user you created in the above step when adding your first share - this way you won't need to run the 'net use' command again
* No need to add and connect to another storage account
* Stop after adding a local compute-enabled share. Do not add a module.
	
Now let's make sure you can connect to your device from your local machine
Open a PowerShell window and open your hosts file by running the following command
``` notepad C:\Windows\System32\drivers\etc\hosts ```

Here you will add two entries
* (device IP) (device name)
	* You should have already added this during the ASE tutorial
	* note the space between device IP and name!
* (Kubernetes API service IP) (Kubernetes API service endpoint)

#### Get the sample camera stream
Since we don't have an actual camera to stream from, we will use a simulated video. Download the file from this folder (camera-300s.mkv) and place it in your local share on your ASE, from file explorer. This will correspond to your "INPUT_VIDEO_FOLDER_ON_DEVICE" variable later on. The video should be titled 'camera-300s.mkv' but if you choose to use another video, make sure to update the instanceset.json file that will be downloaded in the next step, so that the rtspUrl points at the correct file. Note that Live Video Analytics currently runs best with .mkv files.

## STEP 2: SET UP LVA RESOURCES: ##

Follow the directions in the setup [readme file](https://github.com/julialieberman/azure-intelligent-edge-patterns/blob/t-jull-lvasample/Research/lva-ase-sample/src/setup/readme.md)


## Key concepts

Read [Live Video Analytics on IoT Edge concepts](https://docs.microsoft.com/en-us/azure/media-services/live-video-analytics-edge/overview)

## Code of conduct

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

# LVA YoloV3 nGPU ONNX Sample on Jupyter Notebooks 
The following instructions will enable you to run a [YoloV3](http://pjreddie.com/darknet/yolo/) [ONNX](http://onnx.ai/) model on Live Video Analytics (LVA) using Jupyter notebooks. This sample is specific for Nvidia GPU accelerated IoT Edge devices. 

## Prerequisites
1. Install the [requirements for running LVA on Jupyter](../../../common/requirements.md) on your development PC.
2. After installing all of the requirements, [clone](https://code.visualstudio.com/Docs/editor/versioncontrol#_cloning-a-repository) [this repository](/../../) locally into your development PC and open the repository with VSCode. 
3. Locate this Readme page in your local repository and continue reading the following sections on VSCode. You can preview Markdown (`.md`) pages by pressing `Ctrl+Shift+V` to open a full-screen window or by clicking the preview button on the top toolbar in VSCode.  
   
   <img src="../../../../../../images/_markdown_preview.png" width=200px/> 
   <br>

   > <span>[!NOTE]</span>
   > For pictures to render on VSCode, you must have the entire [live-video-analytics](/../..) folder open in your VSCode workspace.
   
   > <span style="color:red; font-weight:bold"> [!IMPORTANT] </span>  
   > Going forward, we will be using VSCode to run this sample. Please navigate to VSCode to continue.
   
## Getting Started
1. In VSCode, [set up the environment](../../../common/setup_environment.ipynb) so that we can test and deploy LVA.
   ><span>[!NOTE]</span>
   >Jupyter notebooks (`.ipynb`) may take several seconds to render in VSCode.
2. Create the required [Azure services](../../../common/create_azure_services.ipynb).
3. You will need an IoT Edge device to deploy the LVA and this sample generated containers. If you don't have a physical IoT Edge device, you can create an [Azure virtual machine](../../../common/create_azure_vm.ipynb).

    > <span style="color:red; font-weight:bold"> [!IMPORTANT] </span>  
    > If you want to run the following sections, you must create a GPU accelerated VM such as the Standard_NC6 VM, which has an NVidia GPU.

<!--
    Change the following steps based on specific instructions.
-->

## Install Drivers for IoT Edge Device
1. Once you have created your VM, check to see what [type of GPU](https://docs.microsoft.com/en-us/azure/virtual-machines/sizes-gpu?toc=/azure/virtual-machines/linux/toc.json&bc=/azure/virtual-machines/linux/breadcrumb/toc.json) comes with your VM. 
2. If your VM has an NVidia GPU, [install](../../../common/install_iotedge_runtime_gpu.md) IoT Edge runtime and the required drivers and tools for your NVidia GPU. 

## Build a Docker Image of the Inference Server
The following sections will explain how to build a Docker container image of an inference server solution that uses AI logic (i.e., YoloV3 for object detection) on a GPU accelerated IoT Edge Device.
1. Create a [YoloV3 inference engine](create_yolov3_ngpu_inference_engine.ipynb). The inference engine wrapper will retrieve image data, analyze it, and return the analysis as output.
2. Create a [local Docker image](create_yolov3_ngpu_container_image.ipynb) to containerize the ML solution. The ML solution consists of a web application and an inference server.
3. Finally, [update the deployment manifest template file](create_yolov3_ngpu_deployment_manifest.ipynb) with a custom template based on this sample. Notice that there is a pre-built deployment manifest template named [deployment.lva_common.template.json](../../../common/deployment.lva_common.template.json), which will be used to generate a new template with specific parameters for this sample.

<!--
1. Optional: You may want to test the Docker image locally before uploading the Docker image to a container registry, to ensure that it runs as expected. To do this, you must meet the following requirements. (If you do not meet all of the requirements, you can skip this.)
   * Your development PC has the same GPU as your IoT Edge device
   * Your development PC has the same GPU drivers installed as your IoT Edge device
   * Your development PC has the same NVidia Docker toolkit installed as your IoT Edge device

    If you are unsure how to install the latter two requirements, you can review the [GPU installation process](../../../common/install_iotedge_runtime_gpu.md#61-install-nvidia-cuda-drivers-for-your-ngpu-tesla-k80-in-this-case). After you have everything set up, you can [test locally](local_test.ipynb). 
-->

## Deploy Your Docker Image
The image below summarizes the deployment scheme of LVA. As the image indicates, LVA can utilize containers hosted on the Internet, on a local network, or even on a local machine.

<img src="../../../../../../images/_architecture.png?raw=true" width=500px/>  

The following sections will explain how to deploy your Docker image and run media graphs on LVA. 

1. Upload the [container image](../../../common/upload_container_image_to_acr.ipynb) to Azure Container Registry (ACR).
2. Once the image has been uploaded onto ACR, you can now [deploy the inference server](../../../common/deploy_iotedge_modules.ipynb) to an IoT Edge device using a deployment manifest. 

## Deploy Media Graphs and Test LVA
1. To run inferences for a single camera, [deploy media graphs](../../../common/deploy_media_graph.ipynb) to trigger the inference server.
2. Alternatively, to simulate running inferences for three different cameras, [deploy multi-camera media graphs](../common/deploy_multi_camera_media_graph.ipynb) to trigger the inference server.
3. Once the media graphs are deployed, [monitor the output](../../../common/monitor_output.md) of the inference server and test to see if it works as desired.
4. Finally, [deactivate and delete](../../../common/delete_media_graph.ipynb) the media graphs to stop the inferences.

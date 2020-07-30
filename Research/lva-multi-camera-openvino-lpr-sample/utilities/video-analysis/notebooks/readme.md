# Jupyter Notebook Samples
<a href="https://azure.microsoft.com/en-us/services/media-services/live-video-analytics" target="_blank">Live Video Analytics on IoT Edge</a> is a new capability of Azure Media Services. Live Video Analytics (LVA) provides a platform for you to build intelligent video applications that span the edge and the cloud. The platform offers the capability to capture, record, analyze live video and publish the results (video and/or video analytics) to Azure services (in the cloud and/or the edge). The platform can be used to enhance IoT solutions with video analytics. This folder contains [Jupyter notebook](https://jupyter.org/) samples for LVA. With Jupyter, you can create and deploy LVA applications on notebooks that contain live code, equations, and formatted text. To get started, click on any of the samples listed in the table below.  

## Prerequisites  
Following items needed to run the below samples:  
- **Development PC<sup>a</sup>:** A physical or a *virtual machine* that will be used to build and deploy the sample.
- **Iot Edge Device<sup>b</sup>:** A physical or a *virtual machine* that the sample will be deployed into. Per [LVA requirement](https://docs.microsoft.com/en-us/azure/media-services/live-video-analytics-edge/overview#supported-environments), this device should be Linux AMD64/X64.
- **Azure Subscription:** An active [Azure subscription](https://azure.microsoft.com/) that will host LVA required services.

Per your preference, your development PC and your IoT Edge device can be the same machine (i.e., developing, debugging, and deploying a sample on the same machine).

> <sup>a</sup> if you need a fresh development PC, you can create an [Azure VM - Azure Virtual Machine](https://docs.microsoft.com/en-us/azure/virtual-machines/) with OS of your choice and connect to it with remote desktop connection for [Windows](https://docs.microsoft.com/en-us/azure/virtual-machines/windows/connect-logon) or for [Linux](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/use-remote-desktop). 

> <sup>b</sup> if you don't have an IoT Edge Device and want to create an Azure VM for it, below samples will guide you with required steps.

## List of samples

From the list below, click the link you want to run.

| # | Name       | Extension | Accelerator| Description | Test cases <br>Passed<sup>i</sup> |
|:---:|:---:        |:---:       |:---:        |:---       |:---:       |
| 1 | [Yolo V3](Yolo/yolov3/yolov3-http-icpu-onnx/readme.md)             | HTTP      | iCPU | LVA module using YoloV3, a neural network for real-time object detection, that complies with the Open Neural Network Exchange (ONNX). Follow this sample if your solution requires an Intel® CPU accelerated IoT Edge device with connection through HTTP. | |
| 2 | [Yolo V3](Yolo/yolov3/yolov3-http-ngpu-onnx/readme.md)             | HTTP      | nGPU<sup>*</sup> |  LVA module using YoloV3, a neural network for real-time object detection, that complies with the Open Neural Network Exchange (ONNX). Follow this sample if your solution requires an NVidia GPU accelerated IoT Edge device with connection through HTTP. | 1, 2, 3, 4 |
| 3 | [Tiny Yolo V3](Yolo/tinyyolov3/tinyyolov3-http-icpu-onnx/readme.md)    | HTTP      | iCPU | LVA module using Tiny YoloV3, a lightweight variant of the Yolo V3 neural network model, that complies with the Open Neural Network Exchange (ONNX). Follow this sample if your solution requires an Intel® CPU accelerated IoT Edge device with connection through HTTP. | |
| 4 | [Tiny Yolo V3](Yolo/tinyyolov3/tinyyolov3-grpc-icpu-onnx/readme.md)                    | gRPC      | iCPU | LVA module using Tiny YoloV3, a lightweight variant of the Yolo V3 neural network model, that complies with the Open Neural Network Exchange (ONNX). Follow this sample if your solution requires an Intel® CPU accelerated IoT Edge device with connection through gRPC. gRPC is a remote procedure call that efficiently connects services in and across data centers with plugin support for load balancing, tracing, health checking and authentication. | |
| 5 | [OpenVINO™](OpenVINO/readme.md)             | HTTP      | iCPU, iGPU<sup>*</sup> |  LVA module using OpenVINO™, a comprehensive toolkit for quickly developing applications and solutions that emulate human vision. Based on Convolutional Neural Networks (CNNs), the toolkit extends CV workloads across Intel® hardware, maximizing performance. | 2, 4 |

<sup>*</sup>  Accelerators:  
iGPU: Intel® GPU  
nGPU: Nvidia GPU

## Test environments<sup>i</sup>:
| Test Case | Development PC<sup>a</sup>                            | IoT Edge Device<sup>b</sup>   |
| :---      | :---                                                  | :---                          |
| 1         | Azure VM<br>-OS: Ubuntu 18.04<br>-Python >= v3.6.9, Pip 3 | Azure VM<br>-OS: Ubuntu 18.04 |
| 2         | Azure VM<br>-OS: Ubuntu 18.04<br>-Python >= v3.6.9 Dev, Pip 3 | Azure VM<br>-OS: Ubuntu 18.04 |
| 3         | Azure VM<br>-OS: Windows 10 Build 2004<br>runnnig [WSL 2 Ubuntu 18.04](https://docs.microsoft.com/en-us/windows/wsl/about)<br>-Python >= v3.6.9, Pip 3 | Azure VM<br>-OS: Ubuntu 18.04 |
| 4         | Physical PC<br>-OS: Windows 10 with Git Bash<br>-Python >=v3.6.9, Pip 3 | Azure VM<br>-OS: Ubuntu 18.04 |  
| 5         | Physical PC<br>-OS: MacOS 15<br>-Python >= v3.6.9, Pip 3 | Azure VM<<br>-OS: Ubuntu 18.04 |  
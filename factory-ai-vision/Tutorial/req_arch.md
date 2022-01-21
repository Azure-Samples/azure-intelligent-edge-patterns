# Prerequisites and Architecture

## Perequisites
This section discusses VoE's prerequisites.

### Hardware

You need to have one of the following:

- **Azure Stack Edge**: A portfolio of devices that bring the compute, storage and intelligence to the edge right where data is created. Find out more [here](https://azure.microsoft.com/en-us/products/azure-stack/edge/)
- **Azure Stack HCI**: A hyperconverged infrastructure (HCI) cluster solution that hosts virtualized Windows and Linux workloads and their storage in a hybrid, on-premises environment. Find out more [here](https://docs.microsoft.com/en-us/azure-stack/hci/overview). You can either:
  - Create a linux VM in your HCI environment by following [this](https://docs.microsoft.com/en-us/azure-stack/hci/manage/vm) and then follow this to [install IoT Edge](https://docs.microsoft.com/en-us/azure/iot-edge/how-to-install-iot-edge-linux) in your VM.
  
or

- **Simulated Azure IoTEdge device** (such as a PC or VM on Azure): Set up Azure IoTEdge on your simulated device : [Instructions on Linux](https://docs.microsoft.com/en-us/azure/iot-edge/how-to-install-iot-edge-linux).
 
#### NOTE: This solution is only supported on Linux based VMs configured with Azure IoTEdge. 

Vision on Edge (VoE) also uses/requires a few Azure services for its various capabilities. Some of these services will be automatically deployed for you (during VoE installation) while others may need you to pre-deploy them before installing VoE. Please follow the VoE installation paths discussed below for more information.

### Services

Depending on your deployment target VoE will need the following Azure services as prerequisites:

- IoTEdge Devices: Azure Custom Vision + IoT Hub + Azure Video Analyzer (Recommended). Only VM deployment is supported.

## Architecture

Vision on Edge uses a combination of modules deployed to your edge devices and Azure services to deliver its capabilities. The graphic below shows how its different components work together at a high level: 

![arch_img](../assets/OVSM-AVA-Arch.png)
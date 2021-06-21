# Running Vision on Edge on Azure IoT Edge for Linux on Windows (EFLOW)

## Prerequisites

### CPU Inferencing
For inferencing on the CPU, your environment should meets the general [EFLOW prerequisites](https://review.docs.microsoft.com/en-us/azure/iot-edge/how-to-install-iot-edge-on-windows?view=iotedge-2018-06&branch=pr-en-us-160649&tabs=powershell#prerequisites).

### GPU Inferencing
For inferencing on the GPU, the following environment setup is required:

Option 1
  - HW: NVIDIA T4
  - OS: Windows Server Build 17763 or higher, or [Windows Insider Preview](https://insider.windows.com/en-us/getting-started#register) Dev Channel, Build 21318 or higher.
  - Drivers: No driver installation required

Option 2
  - HW: NVIDIA GeForce or Quadro (eg. Surface Book - Performance Base with GeForce GTX 965M)
  - OS: [Windows Insider Preview](https://insider.windows.com/en-us/getting-started#register) Dev Channel, Build 20145 or higher.
  - Drivers: Download and Install the appropriate “CUDA on WSL Driver” from NVIDIA’s [website](https://developer.nvidia.com/cuda/wsl/download).

## Installation Instructions
1. Install EFLOW according to the [EFLOW Documentation](https://docs.microsoft.com/en-us/azure/iot-edge/how-to-install-iot-edge-on-windows?view=iotedge-2018-06&tabs=powershell).
2. Deploy VoE using the [shell installer](https://github.com/Azure-Samples/azure-intelligent-edge-patterns/blob/master/factory-ai-vision/Tutorial/Shell-installer-Tutorial.md) or the [ARM Template](https://github.com/Azure-Samples/azure-intelligent-edge-patterns/blob/master/factory-ai-vision/Tutorial/Tutorial_ARM_TemplateDeployment.md).
3. Configure DNS Settings

    Method A - Apply the DNS setting individually for the VoE IoT Edge Module (Recommended)
    1. Navigate to your IoT Hub within your Azure Portal. 
    2. Navigate to your specific IoT Edge device associated with your EFLOW Deployment.
    3. Select Set Modules > webmodule > Container Create Options
    4. Add DNS configuration as shown below

    ![image](https://user-images.githubusercontent.com/7762651/122618915-185c7c80-d044-11eb-96d6-4f5304249d4e.png)
  
    Method B - Apply the DNS setting globally to the EFLOW VM
    From an elevated Powershell window run the following command:
    
    ```
    Invoke-EflowVmSshCommand "echo DNS=8.8.8.8 | sudo tee /etc/systemd/resolved.conf -a && sudo systemctl restart systemd-resolved && sudo systemctl restart docker
    ```

4. Verify Deployment
There are three ways to verify deployment of the IoT modules on EFLOW. In each method, all the Vision on Edge modules should be deployed and running. The exact containers deployed will vary based on your deployment configuration settings.
    1. Azure Portal
    ![IoTEdge](https://user-images.githubusercontent.com/7762651/122620241-4a231280-d047-11eb-940a-d0eee8b144cd.png)

    2. WAC (Windows Admin Center)
    ![VoEinWac](https://user-images.githubusercontent.com/7762651/122620635-4fcd2800-d048-11eb-94a2-29b7b1ba058f.png)

    3. Powershell 
    ![PowershellVoE](https://user-images.githubusercontent.com/7762651/122621016-39739c00-d049-11eb-9742-22536c807638.PNG)
  
5. Enjoy Vision on Edge

    Navigate to http://YOUR_IP:8181/

    You can find your Eflow Vm's IP address by using "ifconfig" or through the EFLOW WAC extension.

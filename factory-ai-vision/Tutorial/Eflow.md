# Running Vision on Edge on Azure IoT Edge for Linux on Windows (EFLOW)

## Prerequisites

### CPU Inferencing
For CPU-based inferencing, your environment should meets the general [EFLOW prerequisites](https://docs.microsoft.com/en-us/azure/iot-edge/gpu-acceleration?view=iotedge-2018-06).

### GPU Inferencing
For GPU-based inferencing, your environment should meets [EFLOW's GPU prerequisites](https://docs.microsoft.com/en-us/azure/iot-edge/gpu-acceleration?view=iotedge-2018-06).

## Installation Instructions
1. Install EFLOW according to the [EFLOW Documentation](https://docs.microsoft.com/en-us/azure/iot-edge/how-to-install-iot-edge-on-windows?view=iotedge-2018-06&tabs=powershell).
2. Deploy VoE using the [shell installer](https://github.com/Azure-Samples/azure-intelligent-edge-patterns/blob/master/factory-ai-vision/Tutorial/Shell-installer-Tutorial.md) or the [ARM Template](https://github.com/Azure-Samples/azure-intelligent-edge-patterns/blob/master/factory-ai-vision/Tutorial/Tutorial_ARM_TemplateDeployment.md).
3. Configure DNS Settings

    Method A - Apply the DNS setting individually for the VoE IoT Edge Module
    1. Navigate to your IoT Hub within your Azure Portal. 
    2. Navigate to your specific IoT Edge device associated with your EFLOW Deployment.
    3. Select Set Modules > webmodule > Container Create Options
    4. Add DNS configuration as shown below

    ![image](https://user-images.githubusercontent.com/7762651/122618915-185c7c80-d044-11eb-96d6-4f5304249d4e.png)
  
    Method B - Apply the DNS setting globally to the EFLOW VM
    From an elevated Powershell window run the following command:
    
    ```
    Invoke-EflowVmCommand "echo DNS=8.8.8.8 | sudo tee /etc/systemd/resolved.conf -a && sudo systemctl restart systemd-resolved && sudo systemctl restart docker
    ```
    For more usage information see the [EFLOW PowerShell fuctions documentation](https://docs.microsoft.com/en-us/azure/iot-edge/reference-iot-edge-for-linux-on-windows-functions?view=iotedge-2018-06)

4. Verify Deployment.
There are three ways to verify deployment of the IoT modules on EFLOW. In each method, all the Vision on Edge modules should be deployed and running. The exact containers deployed will vary based on your deployment configuration settings.
    1. Azure Portal
    ![IoTEdge](https://user-images.githubusercontent.com/7762651/122620241-4a231280-d047-11eb-940a-d0eee8b144cd.png)

    2. WAC (Windows Admin Center)
    ![VoEinWac](https://user-images.githubusercontent.com/7762651/122620635-4fcd2800-d048-11eb-94a2-29b7b1ba058f.png)

    3. Powershell 
    ![PowershellVoE](https://user-images.githubusercontent.com/7762651/122621016-39739c00-d049-11eb-9742-22536c807638.PNG)
  
5. Access the Vision on Edge web-based interface.

    Navigate to http://YOUR_IP:8181/

    You can find your Eflow Vm's IP address by using "ifconfig" or through the EFLOW WAC extension.

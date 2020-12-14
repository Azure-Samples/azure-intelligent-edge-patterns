
  
  

# Quickstart: Deploy your inference module to Azure IoT Edge from the Azure portal

  

This tutorial shows how to deploy your inference module to an IoT Edge device through Azure portal. <br/><br/>

  

## Prerequisites

  

1. An IoT hub in your Azure subscription.

2. An IoT Edge device.

3. A pre-build image URI of the module. <br/><br/>

  

## Deploy your inference module from Azure portal

You can quickly deploy a module from the image URI onto your device in your IoT Hub in the Azure portal.

### Set Module from Azure portal

1. In the Azure portal, navigate to your IoT Hub.

2. On the left pane, under Automatic Device Management, select IoT Edge.

3. Select the IoT Edge device that is to receive the deployment.

4. On the upper bar, select Set Modules.

5. In the IoT Edge Modules section, click Add, and select IoT Edge Module from the drop-down menu.

![Diagram - Set Module from Azure portal](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/set_module_1.png)
</br>
  

### Input all necessary information

Input your desired module name and pre-build image URI.

![Diagram - Input all necessary information](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/set_module_2.png)
</br>

### Review + Create
After setting your module, click **Review + create **  </br>
The review section shows you the JSON deployment manifest that was created based on the modules you set. Check whether the module you set in the previous section is defined in the manifest.

![Diagram - Review + Create](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/set_module_3.png)

Review your deployment information, then select  **Create**.
</br>

 
### Check the deployed module in your edge device
After the deployment, you can check the module in your edge device through **docker ps** command.
  ![Diagram - heck the deployed module in your edge device](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/set_module_4.png)
</br>

Now you have your own inference module in the edge device and the prediction endpoint can be access through ***/score*** with port ***80*** if your image is built from [video-analysis/yolov4-tflite-tiny](https://github.com/Azure/live-video-analytics/tree/master/utilities/video-analysis/yolov4-tflite-tiny).</br>
Your predict endpoint would be ***http://{module name}:80/score*** and can be access only within your edge device.
</br></br>


## Next steps

Learn how to [Bring your own model to the solution](Bring_your_own_model.md)

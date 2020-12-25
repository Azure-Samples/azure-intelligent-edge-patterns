# Quickstart: Deploy your inference module to Azure IoT Edge from the Azure portal

This tutorial shows how to deploy your inference module to an IoT Edge device through Azure portal. <br/><br/>



## Prerequisites

1. An IoT hub in your Azure subscription.
2. An IoT Edge device.
3. A pre-build image of the module. <br/><br/>


## Deploy your inference module from Azure portal

You can quickly deploy a module from the image URI onto your device in your IoT Hub in the Azure portal.

### Push image to registry

After [Tiny YOLOv4 TensorFlow Lite model](https://github.com/Azure/live-video-analytics/tree/master/utilities/video-analysis/yolov4-tflite-tiny) tutorial, you would have the image for the inference module. To deploy the module to your edge device, first you have to push the image to the registry to get image URI.

Before you can push an image to your registry, you must tag it with the fully qualified name of your registry login server. The login server name is in the format `<registry-name>`.azurecr.io (must be all lowercase), for example, mycontainerregistry.azurecr.io.

Tag the image using the docker tag command. Replace `<login-server>` with the login server name of your ACR instance.

```bash
docker tag hello-world <login-server>/hello-world:v1
```

Example:

```bash
docker tag hello-world mycontainerregistry.azurecr.io/hello-world:v1
```

Finally, use docker push to push the image to the registry instance. Replace `<login-server>` with the login server name of your registry instance. This example creates the hello-world repository, containing the hello-world:v1 image.

```bash
docker push <login-server>/hello-world:v1
```

After pushing the image to your container registry, in the above example, your image URI would be **mycontainerregistry.azurecr.io/hello-world:v1**.
<br>
 
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

![Diagram - Input all necessary information](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/set_module_2.png
</br>

### Review + Create

After setting your module, click **Review + create**
</br>

The review section shows you the JSON deployment manifest that was created based on the modules you set. Check whether the module you set in the previous section is defined in the manifest.

![Diagram - Review + Create](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/set_module_3.png)

  

Review your deployment information, then select **Create**.

</br>

  
### Check the deployed module in your edge device
After the deployment, you can check the module in your edge device through **docker ps** command.
![Diagram - heck the deployed module in your edge device](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/set_module_4.png)
</br>

Now you have your own inference module in the edge device and the prediction endpoint can be accessed through **/score** with port **80** if your image is built from [Tiny YOLOv4 TensorFlow Lite model](https://github.com/Azure/live-video-analytics/tree/master/utilities/video-analysis/yolov4-tflite-tiny).</br>
Your predict endpoint would be **http://{module name}:80/score** and can be accessed only within your edge device.
</br></br>


## Next steps


# Quickstart: Bring your own model to the solution

If you have a prebuilt model and tag text file that store all classes for object, you can use this function here with few clicks to see your model go live <br/><br/>

## Prerequisites

Before you start, you should have the following two items:
1. prediction endpoint: <br/>result should follow the format (reference from https://github.com/Azure/live-video-analytics/tree/master/utilities/video-analysis/yolov3-onnx)
2. tag.txt <br/><br/>

## Upload your prebuild model
To upload your model to run on the solution, upload the video for further analysis, first you would have to upload the video file to your IoT Edge device through 

Click on the 'Models' on the platform, and click on '+' to start. ![Diagram - Check RTSP simulator container](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/startadd.png) 
<br/><br/>

## Input all neccessary information
Start inputting all information required to bring the model to the platform
![Diagram - Check RTSP simulator container](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/addmodeldetail.png) 

<br/><br/>

## Start running the model and see the result
Once you added the model, you will see the model shown on the list. 
![Diagram - successed added](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/added.png) 

The next, you will go to deployment and set up the condition. Choose your own model and the object you would like to detect. Once you set the deployment, you will be able to see your own up running and doing inference
![Diagram - deployment](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/chooseownmodel.png) 
<br/><br/>


Learn how to [Bring your own model to the solution](Bring_your_own_model.md)

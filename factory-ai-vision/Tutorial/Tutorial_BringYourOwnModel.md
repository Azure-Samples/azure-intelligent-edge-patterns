# Tiny YOLOv4 TensorFlow Lite model

The following instructions will enable you to build a docker container with a YOLOv4 (tiny) TensorFlow Lite model using nginx, gunicorn, flask, and runit. The app code is based on the tensorflow-yolov4-tflite project. This project uses TensorFlow v2.3.0.
Note: References to third-party software in this repo are for informational and convenience purposes only. Microsoft does not endorse nor provide rights for the third-party software. For more information on third-party software please see the links provided above.<br/><br/>

https://github.com/Azure/live-video-analytics/tree/master/utilities/video-analysis/yolov4-tflite-tiny
<br/><br/>

## Prerequisites

1.	Install Docker on your machine
2.	Install curl

## Building the docker container

1.	Create a new directory on your machine and copy all the files (including the sub-folders) from this GitHub folder to that directory.
2.	Go to https://github.com/Azure/live-video-analytics and download zip in your local machine


![Diagram - Check download source code path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/Tutorial_BringYourOwnModel_Screenshot1.png) 
<br/><br/>

After download the files shows as below in local machine.
![Diagram - Check download source code path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/Tutorial_BringYourOwnModel_Screenshot2.png) 
<br/><br/>

Step1: open Terminal 
Step 2: go to below path in the downloaded folder

 live-video-analytics-master/utilities/video-analysis/yolov4-tflite-tiny

![Diagram - Check download source code path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/Tutorial_BringYourOwnModel_Screenshot3.png) 
<br/><br/>

3.	Build the container image (should take some minutes) by running the following docker command from a command window in that directory.

docker build . -t yolov4-tflite-tiny:latest

![Diagram - Check download source code path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/Tutorial_BringYourOwnModel_Screenshot4.png) 
<br/><br/>

# Push image to registry

After Tiny YOLOv4 TensorFlow Lite model tutorial, you would have the image for the inference module. To deploy the module to your edge device, first you have to push the image to the registry to get image URI.
Before you can push an image to your registry, you must tag it with the fully qualified name of your registry login server. The login server name is in the format <registry-name>.azurecr.io (must be all lowercase), for example, mycontainerregistry.azurecr.io.

![Diagram - Check download source code path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/Tutorial_BringYourOwnModel_Screenshot5.png) 
<br/><br/>

Tag the image using the docker tag command. 
Replace <login-server> with the login server name of your ACR instance.
![Diagram - Check download source code path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/Tutorial_BringYourOwnModel_Screenshot6.png) 
<br/><br/>

![Diagram - Check download source code path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/Tutorial_BringYourOwnModel_Screenshot7.png) 
<br/><br/>

Finally, use docker push to push the image to the registry instance. Replace <login-server> with the login server name of your registry instance. 
This example creates the hello-world repository, containing the hello-world:v1 image.

For Example: 

docker push reenacr.azurecr.io/reenadk_yolov4:v1

![Diagram - Check download source code path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/Tutorial_BringYourOwnModel_Screenshot8.png) 
<br/><br/>

After pushing the image to your container registry, in the above example, your image URI would be mycontainerregistry.azurecr.io/hello-world:v1
•	Now this new push image will show in user’s Container registry’s repository.
This is to verify if push images pushed successfully 



![Diagram - Check download source code path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/Tutorial_BringYourOwnModel_Screenshot9.png) 
<br/><br/>

![Diagram - Check download source code path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/Tutorial_BringYourOwnModel_Screenshot10.png) 
<br/><br/>

## Set Module from Azure portal

1.	In the Azure portal, navigate to your IoT Hub.


![Diagram - Check download source code path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/Tutorial_BringYourOwnModel_Screenshot11.png) 
<br/><br/>

2.	On the left pane, under Automatic Device Management, select IoT Edge

![Diagram - Check download source code path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/Tutorial_BringYourOwnModel_Screenshot12.png) 
<br/><br/>

3.	Select the IoT Edge device that is to receive the deployment.


![Diagram - Check download source code path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/Tutorial_BringYourOwnModel_Screenshot13.png) 
<br/><br/>

4.	On the upper bar, select Set Modules.




![Diagram - Check download source code path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/Tutorial_BringYourOwnModel_Screenshot14.png) 
<br/><br/>

•	Insert Name , Address , Username and Password Field 
•	Then Press “ADD”



![Diagram - Check download source code path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/Tutorial_BringYourOwnModel_Screenshot15.png) 
<br/><br/>

5.	In the IoT Edge Modules section, click Add, and select IoT Edge Module from the drop-down menu.




![Diagram - Check download source code path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/Tutorial_BringYourOwnModel_Screenshot16.png) 
<br/><br/>

•	Insert IoT Edge Module Name and Image URL which is path as below example

![Diagram - Check download source code path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/Tutorial_BringYourOwnModel_Screenshot17.png) 
<br/><br/>

## Input all necessary information

Input your desired module name and pre-build image URI.
![Diagram - Input all necessary information](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/set_module_2.png

## Review + Create
After setting your module, click Review + create
The review section shows you the JSON deployment manifest that was created based on the modules you set. Check whether the module you set in the previous section is defined in the manifest.


![Diagram - Check download source code path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/Tutorial_BringYourOwnModel_Screenshot18.png) 
<br/><br/>

Review your deployment information, then select Create.


![Diagram - Check download source code path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/Tutorial_BringYourOwnModel_Screenshot19.png) 
<br/><br/>

Now you have your own inference module in the edge device and the prediction endpoint can be accessed through /score with port 80 if your image is built from Tiny YOLOv4 TensorFlow Lite model.
Your predict endpoint would be http://{module name}:80/score and can be accessed only within your edge device.

For example: http://Reenadk_yolo:80/score

## Next steps

## Quickstart: Bring your own model to the solution

If you have a prebuilt model and tag text file that store all classes for object, you can use this function here with few clicks to see your model go live

## Prerequisites

Before you start, you should have the following two items:
1.	prediction endpoint:
result should follow the format (reference from https://github.com/Azure/live-video-analytics/tree/master/utilities/video-analysis/yolov3-onnx)
2.	tag.txt

## Upload your prebuild model

To upload your model to run on the solution, upload the video for further analysis, first you would have to upload the video file to your IoT Edge device through
Click on the 'Models' on the platform, and click on '+' to start.

## Input all necessary information

Start inputting all information required to bring the model to the platform



![Diagram - Check download source code path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/Tutorial_BringYourOwnModel_Screenshot20.png) 
<br/><br/>

•	Created Model will show in the list


![Diagram - Check download source code path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/Tutorial_BringYourOwnModel_Screenshot21.png) 
<br/><br/>

•	Select ModelName
•	Select Camera
•	Select Objects 
•	Click Redeploy
•	Go to Deployment > Edit task and click “Redeploy” 



![Diagram - Check download source code path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/Tutorial_BringYourOwnModel_Screenshot22.png) 
<br/><br/>

![Diagram - Check download source code path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/Tutorial_BringYourOwnModel_Screenshot23.png) 
<br/><br/>

![Diagram - Check download source code path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/Tutorial_BringYourOwnModel_Screenshot24.png) 
<br/><br/>

•	Then go to Edit task – Advance setting- click enable cloud messages


![Diagram - Check download source code path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/Tutorial_BringYourOwnModel_Screenshot25.png) 
<br/><br/>

•	Then Redeploy and go to Azure IOT Explorer (preview) and select device(cam4)

![Diagram - Check download source code path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/Tutorial_BringYourOwnModel_Screenshot26.png) 
<br/><br/>

•	Click on cam4, then go to Telemetry and Start button to get IOT hub message:


![Diagram - Check download source code path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/Tutorial_BringYourOwnModel_Screenshot27.png) 
<br/><br/>

![Diagram - Check download source code path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/Tutorial_BringYourOwnModel_Screenshot28.png) 
<br/><br/>





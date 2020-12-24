

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


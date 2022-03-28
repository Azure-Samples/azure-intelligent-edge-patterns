# Build and deploy your AI skill on your RTSP IP camera

Vision on Edge (VoE) provides a no-code UI that lets you create and deploy your AI skill on your RTSP IP camera. 
This topic shows how to use the VoE intuitive UI to build and deploy your AI skill, so VoE can use your model to identify parts from your camera's live feed, 
providing actions and insights such as inference metrics and live analytics.

## Prerequisites
Before you start, you should have access to an instance of VoE deployed on Azure VM: [Vision on Edge (azure.com)](http://voeprompt.westus2.cloudapp.azure.com:8181/home/getStarted).

## Create a custom model project
To create a custom model, do the following:

1. Open your browser and paste the link http://voeprompt.westus2.cloudapp.azure.com:8181/home/getStarted to launch an instance of VoE.
2. On the VoE platform, click <b>Models</b>, and then click <b>+</b> Create custom. <br>
<img src="https://github.com/michellechena/a2-webfileapi/blob/master/how_to_build_deploy_custom_model_platform_model1.png" width="200px" height="150px"/>
3. On the <b>New Model</b> page, input relevant information and then click <b>Add</b>. For example, we named Retail Intelligence Insights as our model with three objects/tags: person, food, and drink.<br/>
<img src="https://github.com/michellechena/a2-webfileapi/blob/master/how_to_build_deploy_custom_model_newmodel1.png" width="200px" height="350px"/>

## Create your own video feed
To create your own video feed, do the following:
1. On the VoE platform, click <b>Camera</b>, and then click <b>+</b> Add to start.
2. On the <b>Add Camera</b> page, input relevant information, and then click <b>Add</b>. If you don’t have an RTSP URL for your own RTSP IP camera, you can use the following URL for the simulated IP camera provided by the VoE instance you are using.  
```
rtsp://rtspsim:554/media/upload/K52E3h2HkM6vFYFIVhclWggSxiGWbO.mkv
```
## Capture images and tag objects
To capture images and tag objects, do the following:
1.	On the VoE platform, click <b>Images</b>, and then from the <b>Select Model</b> dropdown, select your custom model.
2.	Capture images from your video feed or upload images, and then tag objects in each image. For example, we tagged person, food, and drink defined in our custom model in the following image. To improve your model, we recommend at least 15 images per object.
<img src="https://github.com/michellechena/a2-webfileapi/blob/master/how_to_build_deploy_custom_model_taggedobjects1.png" width="550px" height="350px"/> 

## Deploy your model
To deploy your model, do the following:
1.	On the VoE platform, click <b>Deployment</b>, and then click <b>+</b> Create new task.
2.	On the <b>Deploy task</b> page, input relevant information, and then click <b>Deploy</b>. 
3.	On the <b>Deployment page</b>, insights such as inference metrics and live analytics appear.

## Next steps
* Learn <a href="" target="_blank">how to deploy a pre-built model</a>
* Learn <a href="" target="_blank">how to deploy your own instance of VoE on Azure VM</a>
* Learn <a href="" target="_blank">how to create a cascade</a>

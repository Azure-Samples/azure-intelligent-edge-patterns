Building Your First VisionOnEdge (VoE) Model
============================================

Building Machine Learning (ML) models and bringing them into production is often difficult, depending on complicated platforms and expensive expertise. VisionOnEdge (VoE) simplifies this process by integrating devices and models in a no-code environment. To see this for yourself, let's build your first model together.

Setup
-----

[This][sim] is an instance of VoE deployed on Azure VM where we have already added a simulated camera and a couple of models to simplify the journey for you.

[sim]:https://nam06.safelinks.protection.outlook.com/?url=http%3A%2F%2Fvoeprompt.westus2.cloudapp.azure.com%3A8181%2Fhome%2FgetStarted&data=04%7C01%7Camira.youssef%40microsoft.com%7Cb7f3d7a365514c1eccdf08da017b7774%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C637823927036393961%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C3000&sdata=NKCWM4F7ts71ylmY1BDQsArtwmMEMWJRKDs1Z0%2Bhj30%3D&reserved=0

![VoE home](/docs/assets/VoE_1.png)

Let's select our model
----------------------
1. Let's first click on the "Go to models" in the 'Create your own project box'. This will lead you to: 

![VoE model](/docs/assets/VoE_2.png)

2. Click on the "Create custom" link in the top menu. 

![VoE model](/docs/assets/VoE_3.png)

This will pop up the New Model box. Don't worry! We'll be using an existing project. 

3. Click on the "Create from existing project" link and scroll all the way to the bottom where you will select 'Retail Counting People' and then the "Add" button at the bottom. 

![VoE model](/docs/assets/VoE_4.png)

Congratulations, the 'Retail Counting People' is now in your models. When we collect enough images, at least 15, we'll be able to train the model. 

Gathering Images
----------------

We have to capture images and that requires adding a camera. It is possible to use multiple cameras or uploading images which can be very helpful in adding more data for our model which increases its accuracy. For now, we'll use one camera.

1. Let's do that now by clicking on "Cameras" from the left menu. You'll notice that there are already three cameras with their locations and URLs available.

![VoE model](/docs/assets/V0E_5.png)

2. Select whichever camera you desire. This will bring up the feed from that camera and we're now ready to capture images to train our model. Do that by clicking on "Capture image".

![VoE model](/docs/assets/VoE_6.png)

When you do that you will be led to a dropdown box to choose your model. 

3. Select the 'Retail Counting People' model. This will lead us to the "Images" window. Notice that it has 'Tagged' and 'Untagged' tabs. 

4. Click on the "Capture from camera" button. The capture popup appears with a dropdown to select a camera. 

![VoE model](/docs/assets/VoE_7.png)

5. We only have one camera, so select it and the data will begin to stream.

6. On the right of the popup is the "Capture image" button. Click on it throughout the video. We need at least 15 images, so don't be afraid you'll collect too many. 

As soon as we started gathering images, the "Go to tagging" button appeared. Now that we have enough images we can identify the objects of interest for our model and use case.

![VoE model](/docs/assets/VoE_8.png)

Identifying People
------------------

1. Click the "Go to tagging button". At the top right we enter a name for our object. It's a good idea to choose something simple and descriptive like 'person'. 

Now it's time to identify for the model the parts of the picture we want it to pay attention to. When you move your mouse into the picture frame the cursor changes. This is to allow you to draw boxes around the people. A good rule of thumb is to capture all the edges without too much background. Detecting edges and shapes is an essential part of the model's algorithm. The more accurate the boxes (called 'bounding boxes'), the more accurate the model.

2. Draw boxes around the people. The boxes display the 'person' tag we assigned. If you don't like the image because it's difficult to draw the boxes, you can delete it with the "delete image" button in the bottom left. Once you finish drawing boxes around the objects, select the "Next" button until all your images are tagged.

Now that the images have been tagged, go to the "Images" page and click on the 'Tagged' tab. You'll see all of your images and tags.

![VoE model](/docs/assets/VoE_9.png)

Training The Model
------------------

Now we have gathered our images and identified the people in them. It's time to train the model.

1. Click on "Models" in the left menu and then the "Retail Counting People" model. This will open the "Edit Model" popup where we now have a "Train" button.

![VoE model](/docs/assets/VoE_10.png)

Before we press that button (yep it's really tempting!), pause for a second and consider what you've done so far. You've set up a model, assigned cameras for input, captured images, and tagged them all without code.

2. OK, hit the "Train" button!

You'll see a message that the model is training. This may take a while depending on how much data is evaluated.

3. When the model is trained save it by clicking "Save".

Deploy The Model
----------------

Now it's time for the payoff. We'll take our model and run it against other video to count the people in the frame.

1. Select "Deployment" from the left menu and "Create new task" from the top menu. A popup will appear with four boxes.

![VoE model](/docs/assets/VoE_11.png)

3. Assign a task name of your choosing in the first box. 
4. Select the Model, Camera, and Objects from the dropdowns.
5. Click "Deploy".
6. Select the camera from the dropdown.

The Deploy screen is displayed and you will see the model's identification of people in white bounding boxes with a percentage indicating the confidence of that identification.

![VoE model](/docs/assets/VoE_12.png)

To the right of the image you'll see the package used, OpenVINO and the time for execution of the model. Below that the inference metrics provide the success rate and the Live Analytics is the count of people in the image.


Next Steps
----------

Now that you've built a model in this environment it's time to dig in and understand how you can build your model from scratch. [This][next] tutorial will teach you about the hardware and software requirements to get started. 

[next]:https://github.com/Azure-Samples/azure-intelligent-edge-patterns/blob/master/factory-ai-vision/Tutorial/req_arch.md

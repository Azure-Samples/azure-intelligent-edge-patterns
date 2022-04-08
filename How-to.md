Building Your First VisionOnEdge (VoE) Model
============================================

Building Machine Learning (ML) models and bringing them into production is often difficult, depending on complicated platforms and expensive expertise. VisionOnEdge (VoE) simplifies this process by integrating devices and models in a no-code environment. To see this for yourself, let's build your first model together.

Setup
-----

[This][sim] is an instance of VoE deployed on Azure VM where we have already added a simulated camera and a couple of models to simplify the journey for you.

[sim]:https://nam06.safelinks.protection.outlook.com/?url=http%3A%2F%2Fvoeprompt.westus2.cloudapp.azure.com%3A8181%2Fhome%2FgetStarted&data=04%7C01%7Camira.youssef%40microsoft.com%7Cb7f3d7a365514c1eccdf08da017b7774%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C637823927036393961%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C3000&sdata=NKCWM4F7ts71ylmY1BDQsArtwmMEMWJRKDs1Z0%2Bhj30%3D&reserved=0

![VoE home](/docs/assets/VoE_1.png)

Let's build the model step-by-step.
-----------------------------------
1. Let's first click on the "Go to models" in the 'Create your own project box'. This will lead you to: 

![VoE model](/docs/assets/VoE_2.png)

2. Click on the "Create custom" link in the top menu. 

![VoE model](/docs/assets/VoE_3.png)

This will pop up the New Model box. Don't worry! We'll be using an existing project. 

3. Click on the "Create from existing project" link and scroll all the way to the bottom where you will select 'Retail Counting People' and then the "Add" button at the bottom. 

![VoE model](/docs/assets/VoE_4.png)

Congratulations, the 'Retail Counting People' is now in your models. When we collect enough images, at least 15, we'll be able to train the model. We have to capture them first and that requires adding a camera. 

4. Let's do that now by clicking on "Cameras" from the left menu. You'll notice that there are already three cameras with their locations and URLs available.

![VoE model](/docs/assets/VoE_5.png)

5. Select whichever camera you desire. This will bring up the feed from that camera and we're now ready to cature images to train our model. Do that by clicking on "Capture image".

![VoE model](/docs/assets/VoE_6.png)

When you do that you will be led to a dropdown box to choose your model. 

6. Select the 'Retail Counting People' model.

Next Steps
----------


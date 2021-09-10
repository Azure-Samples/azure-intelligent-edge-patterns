

# Vision on Edge Shell Installer

## Prerequisites

To install the Vision on Edge Solution Accelerator, the following three prerequisites are required:

<br/>1. An IoT device with key and endpoint.
<br/>See the below link to find your training key [here](https://www.customvision.ai/projects#/settings) and learn more [here](https://azure.microsoft.com/en-us/services/cognitive-services/custom-vision-service/)
![arch_img](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/develop/factory-ai-vision/assets/customvisioninfo.png)
<br/>
<br/>
<br/>2. AVA account to get AVA Provision Token. 
![arch_img](https://raw.githubusercontent.com/linkernetworks/azure-intelligent-edge-patterns/feat/cascade-dev/factory-ai-vision/assets/create%20va%20account_20210902.png)
<br/>
<br/>
<br/>3. An IoT Hub with edge device

To deploy the solution to an Azure Stack Edge device, your subscription must contain Azure Stack Edge with compute enabled as per [documentaton here](https://docs.microsoft.com/en-us/azure/databox-online/azure-stack-edge-gpu-deploy-configure-compute) or IoT hub Edge device with port 8181 opened. Please follow this [documentation](https://github.com/Azure-Samples/azure-intelligent-edge-patterns/blob/master/factory-ai-vision/Tutorial/CreateIoTEdgeDevice.md) for deployment information





   
## Get Started 

1. Open your browser and paste the link https://shell.azure.com/  to open the shell installer. 
2. You will need a Azure subscription to continue. Choose your Azure account.
![arch_img](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/develop/factory-ai-vision/assets/step1.png)
3. To download installer (acs.zip) from github by putting the following command `wget -O acs.zip https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/feat/cascade-dev/factory-ai-vision/Installer/acs.zip`
![arch_img](https://raw.githubusercontent.com/linkernetworks/azure-intelligent-edge-patterns/feat/cascade-dev/factory-ai-vision/assets/step2_20210902.png)
4. Unzip it `unzip -o acs.zip`. 
![arch_img](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/feat/cascade-dev/factory-ai-vision/assets/step3_20210902.png?raw=true)
5. Execute the installer `bash factory-ai-vision-install.sh`

6. It will check the az command and check if it requires any installing/updating the IoT extension
<br/>You would be asked:
<br/>Would you like to use an existing Custom Vision Service? (y or n):  y 
<br/>To learn more about Custom Vision Service, please refer the linke [here](https://azure.microsoft.com/en-us/services/cognitive-services/custom-vision-service/)
<br/>If you choose “yes”, you will asked to input your training endpoint and key.
<br/>Please enter your Custom Vision endpoint: xxxxxx
<br/>Please enter your Custom Vision Key: xxxxxx
<br/> You can find your training key [here](https://www.customvision.ai/projects#/setting)
![arch_img](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/feat/cascade-dev/factory-ai-vision/assets/step4_20210902.png?raw=true)

7. If you choose not to use an existing account, please go ahead and create a new one using the instruction
![arch_img](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/develop/factory-ai-vision/assets/step5.png)

8. Once you input custom vision account information. You will be asked whether to use Azure Video Analytics (y), and then please enter your AVA Provision Token. 
<br/>Do you want to install with Azure Video Analytics? (y or n):y
<br/> Please enter your AVA Provision Token
![arch_img](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/feat/cascade-dev/factory-ai-vision/assets/step6_20210902.png?raw=true)

9. There will be a list of IoT Hubs resources listed. Please choose your desired/appropriate resource.
<br/>It will then show a list of devices in your account, and choose the device to install your vision on edge. 

![arch_img](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/feat/cascade-dev/factory-ai-vision/assets/step7_20210902.png?raw=true)

10. Choose cpu to correspond to Edge device.
![arch_img](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/feat/cascade-dev/factory-ai-vision/assets/step8_20210904.png?raw=true)

11. The installation will be scheduled to complete.
<br/> You can check the deployment status on the [Azure portal](https://portal.azure.com/#home)
<br/>It takes to get everything deployed and till then the IOT console will temporarily show error, please wait. 

12. After installation is completed, please check your device to get the IP address,
<br/> Properties-> Networking -> Public IP address
<br/> Open your browser, connect to http://YOUR_IP:8181
e.g.  connect to http://168.63.246.174:8181

13. Check out our tutorials on youtube channel 

- Tutorial 2 - <a href="https://youtu.be/dihAdZTGj-g" target="_blank">Start with prebuilt scenario</a>
- Tutorial 3 - <a href="https://www.youtube.com/watch?v=cCEW6nsd8xQ" target="_blank">Start with creating new project, capture images, tagging images and deploy</a>
- Tutorial 4 - <a href="https://www.youtube.com/watch?v=OxK9feR_T3U" target="_blank">Retraining and improve your model</a>
- Tutorial 5 - <a href="https://www.youtube.com/watch?v=Bv7wxfFEdtI" target="_blank">Advance capabilities setting</a>



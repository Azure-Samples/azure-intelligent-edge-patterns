

# Vision on Edge Shell Installer

## Prerequisites

To install the Vision on Edge Solution Accelerator, the following prerequisites are required:

1. You must have an Azure subscription.
<br/> if you don’t have one, you can create one here: https://azure.microsoft.com/en-us/pricing/purchase-options/pay-as-you-go/
2. That subscription must contain Azure Stack Edge with compute enabled as per [documentaton here](https://docs.microsoft.com/en-us/azure/databox-online/azure-stack-edge-gpu-deploy-configure-compute) or IoT hub Edge device with port 8181 opened. please follow this [documentation](https://github.com/Azure-Samples/azure-intelligent-edge-patterns/blob/master/factory-ai-vision/Tutorial/CreateIoTEdgeDevice.md) for deployment information
3. Azure Custom Vision account, see the below link to find your training key [here](https://www.customvision.ai/projects#/settings) and learn more [here](https://azure.microsoft.com/en-us/services/cognitive-services/custom-vision-service/)
![arch_img](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/develop/factory-ai-vision/assets/customvisioninfo.png)
4. (Optional) Azure Media Service, please follow the document to create one https://docs.microsoft.com/en-us/azure/media-services/latest/create-account-howto?tabs=portal
5. (Optional) Azure Time Series Insight environment. If you would like to use the Azure portal to add an event source that reads data from Azure IoT Hub to your Azure Time Series Insights environment, please follow this instruction https://docs.microsoft.com/en-us/azure/time-series-insights/how-to-ingest-data-iot-hub  
   
### Get Started:

1. Open your browser and paste the link https://shell.azure.com/  to open the shell installer. 
2. You will need a Azure subscription to continue. Choose your Azure account.
![arch_img](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/develop/factory-ai-vision/assets/step1.png)
3. To download installer (acs.zip) from github by putting the following command `wget -O acs.zip https://go.microsoft.com/fwlink/?linkid=2163300`
![arch_img](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/develop/factory-ai-vision/assets/step2.png)
4. Unzip it `unzip -o acs.zip`. 
![arch_img](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/develop/factory-ai-vision/assets/step3.png)
5. Execute the installer `bash factory-ai-vision-install.sh`

6. It will check the az command and check if it requires any installing/updating the IoT extension
<br/>You would be asked:
<br/>Would you like to use an existing Custom Vision Service? (y or n):  y 
<br/>To learn more about Custom Vision Service, please refer the linke [here](https://azure.microsoft.com/en-us/services/cognitive-services/custom-vision-service/)
<br/>If you choose “yes”, you will asking to input endpoint and key.
<br/>Please enter your Custom Vision endpoint: xxxxxx
<br/>Please enter your Custom Vision Key: xxxxxx
<br/> You can find your training key [here](https://www.customvision.ai/projects#/setting)
![arch_img](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/develop/factory-ai-vision/assets/step4.png)

7. If you choose not to use existing account, please go ahead to create a new one with the instruction
![arch_img](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/develop/factory-ai-vision/assets/step5.png)

8. Once you input custom vision account information. The next you will be able to choose if you want to install with LVA or opencv. 
<br/>Do you want to install with Azure Live Video Analytics? (y or n): 
<br/>If you choose YES, select from one of listing Azure Media Service in your account.
<br/>And Choose the number corresponding to your Azure Media Service. This is where you will be asked for the principle secret 
![arch_img](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/develop/factory-ai-vision/assets/step6.png)

9. Or if you don’t have one, but you would like to install with LVA, please go ahead and create a [new account] and come back to continue the installer. 
<br/>And please copy the "SERVICE-PRINCIPLE-SECRET" information in the bottom
<br/>You will need the secret information for later use
![arch_img](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/develop/factory-ai-vision/assets/step7.png)
<br/>You will being with opencv installation if you choose “no”

10. There will be a list of IoT hubs, please choose “customvision”
![arch_img](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/develop/factory-ai-vision/assets/step8.png)

11. It will show a list of devices in your account, and choose the device to install your visiononedge 
<br/>You will be asking if your device have a GPU or not
![arch_img](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/develop/factory-ai-vision/assets/step9.png)

12. The installation will be started after. Please wait for couple minutes to complete the installation. 
<br/> You can check the deployment status on the [Azure portal](https://portal.azure.com/#home)

13. Go to your device --> Properties-->Networking--> 

Public IP address(  get your IP address)
168.63.246.174

Open your browser, connect to http://YOUR_IP:8181
e.g.  connect to http://168.63.246.174:8181

14. Check out our tutorials on youtube channel 


- Tutorial 2 - <a href="https://youtu.be/dihAdZTGj-g" target="_blank">Start with prebuilt scenario</a>
- Tutorial 3 - <a href="https://www.youtube.com/watch?v=cCEW6nsd8xQ" target="_blank">Start with creating new project, capture images, tagging images and deploy</a>
- Tutorial 4 - <a href="https://www.youtube.com/watch?v=OxK9feR_T3U" target="_blank">Retraining and improve your model</a>
- Tutorial 5 - <a href="https://www.youtube.com/watch?v=Bv7wxfFEdtI" target="_blank">Advance capabilities setting</a>



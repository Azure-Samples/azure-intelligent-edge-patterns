

# Vision on Edge Shell Installer

## Prerequisites

To install the Vision on Edge Solution Accelerator, the following prerequisites are required:

1. You must have an Azure subscription.
<br/> if you don’t have one, you can create one here: https://azure.microsoft.com/en-us/pricing/purchase-options/pay-as-you-go/
2. That subscription must contain an IoT Hub with a registered IoT Edge device (generally this will be an Azure Stack Edge Device).
<br/>At least one IoT Edge with port 8080 and 5000 opened and is connected to your Iot Hub. please follow this [documentation](https://docs.microsoft.com/en-us/azure/iot-edge/quickstart-linux) for deployment information
3. Azure Custom Vision account, see the below link to find your training key [here](https://www.customvision.ai/projects#/settings)
4. Azure Media Service, please follow the document to create one https://docs.microsoft.com/en-us/azure/media-services/latest/create-account-howto?tabs=portal
 
   
### Get Started:

1. Open your browser and paste the link https://shell.azure.com/  to open the shell installer. And choose “bash” mode
2. You will need a Azure subscription to continue. Choose your Azure account.
![arch_img](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/develop/factory-ai-vision/assets/step1.png)
3. To download acs.zip from github `wget https://github.com/Azure-Samples/azure-intelligent-edge-patterns/raw/master/factory-ai-vision/Installer/acs.zip`
![arch_img](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/develop/factory-ai-vision/assets/step2.png)
4. Unzip it `unzip acs.zip`. If you have downloaded before, the file name might be different with an extension. The file name can be found above if is different from acs.zip listed above. 
![arch_img](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/develop/factory-ai-vision/assets/step3.png)
5. Execute the installer `bash factory-ai-vision-install.sh`

6. It will check the az command and check if it requires any installing/updating the IoT extension
<br/>You would be asking:
<br/>Would you like to use an existing Custom Vision Service? (y or n):  y 
<br/>If you choose “yes”, you will asking to input endpoint and key.
<br/>Please enter your Custom Vision endpoint: xxxxxx
<br/>Please enter your Custom Vision Key: xxxxxx
![arch_img](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/develop/factory-ai-vision/assets/step4.png)

7. If you choose not to use existing account, please go ahead to create a new one with the instruction
![arch_img](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/develop/factory-ai-vision/assets/step5.png)

8. Do you want to use Azure Live Video Analytics? (y or n): 
<br/>If you choose yes, 
<br/>Select from one of listing Azure Media Service 
<br/>And Choose the number corresponding to your Azure Media Service. This is where you will be asking for the principle secret 
![arch_img](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/develop/factory-ai-vision/assets/step6.png)

9. Or if you don’t have one, it will create new azure media service principle for you. 
<br/>And please copy the "SERVICE-PRINCIPLE-SECRET" information in the bottom
<br/>You will need the secret information for later usage 
![arch_img](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/develop/factory-ai-vision/assets/step7.png)
<br/>If you would like to install with opencv version, please input “no”

10. There will be a list of IoT hubs, please choose “customvision”
![arch_img](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/develop/factory-ai-vision/assets/step8.png)

11. It will show a list of devices in your account, and choose the device to install your visiononedge 
<br/>You will be asking if your device have a GPU or not
![arch_img](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/develop/factory-ai-vision/assets/step9.png)

12. The installation will be started after. Please wait for couple minutes to complete the installation. 
<br/>Open your browser, connect to http://YOUR_IP:8080


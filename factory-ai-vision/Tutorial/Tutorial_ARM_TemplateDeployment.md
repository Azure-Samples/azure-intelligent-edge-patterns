
# ARM Template Deployment :


## Prerequisites

To install ARM Template Deployment, the following prerequisites are required:

1.	You must have an Azure subscription. 
if you don’t have one, you can create one here: https://azure.microsoft.com/en-us/pricing/purchase-options/pay-as-you-go/

2.	That subscription must contain Azure Stack Edge or IoT hub Edge device with port 8181 opened. please follow this documentation for deployment information 

3.	Azure Custom Vision account, see the below link to find your training key here and learn more here
<br/><br/>

![Diagram - Custom vision setting path](
https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/linker/factory-ai-vision/assets/Tutorial_ArmTemplate_Deployment_Screenshot1.png) 
<br/><br/>


## Step 2: Click on the setting icon on the top

## Step 3: Create a new account, can get the app at the Azure Marketplace

![Diagram - Custom vision Market place path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/linker/factory-ai-vision/assets/Tutorial_ArmTemplate_Deployment_Screenshot1.1.png) 
<br/><br/>

## Please follow below links for reference


•	https://docs.microsoft.com/en-us/azure/cognitive-services/custom-vision-service/getting-started-build-a-classifier#create-custom-vision-resources

•	https://portal.azure.com/?microsoft_azure_marketplace_ItemHideKey=microsoft_azure_cognitiveservices_customvision#create/Microsoft.CognitiveServicesCustomVision

![Diagram - Custom vision Market place path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/linker/factory-ai-vision/assets/Tutorial_ArmTemplate_Deployment_Screenshot1.2.png) 
<br/><br/>


![Diagram - Custom vision Market place path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/linker/factory-ai-vision/assets/Tutorial_ArmTemplate_Deployment_Screenshot1.3.png) 
<br/>


## Step4: Choose the resources under the account; you will see information of “Key” and “Endpoint”

![Diagram - Custom vision Market place path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/linker/factory-ai-vision/assets/Tutorial_ArmTemplate_Deployment_Screenshot2.png) 
<br/><br/>

## Additonal Prerequisites
## 1.	Create an IoT Hub using the Azure portal 
Please find the information by below URL 
https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-create-through-portal 
## 2.	Install Azure IoT Edge for Linux  
Please find the information by below URL 
https://docs.microsoft.com/en-us/azure/iot-edge/how-to-install-iot-edge?view=iotedge-2020-11

# Get Started :

## 	Step 1: Open your browser and paste the link

https://portal.azure.com/#create/Microsoft.Template

![Diagram - Custom vision Market place path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/linker/factory-ai-vision/assets/Tutorial_ArmTemplate_Deployment_Screenshot3-2.png) 
<br/><br/>

## Step 1.1: Please fill the below mandatory field and check the below instruction of each field to decide the information needed for go ahead.

### 1.1.1 : Subscription:

Definition:  All resources in an Azure subscription are billed together.  
 Example: Microsoft Azure Sponsorship

![Diagram - Custom vision Market place path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/linker/factory-ai-vision/assets/Tutorial_ArmTemplate_Deployment_Screenshot4.png) 
<br/><br/>

### 1.1.2: Resource Group: 

Definition:  A resource group is a collection of resources that share the same life cycles, permissions and policies.  
Example: customvision

![Diagram - Custom vision Market place path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/linker/factory-ai-vision/assets/Tutorial_ArmTemplate_Deployment_Screenshot5.png) 
<br/><br/>

A resource group can be created by click “Create new”

![Diagram - Custom vision Market place path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/linker/factory-ai-vision/assets/Tutorial_ArmTemplate_Deployment_Screenshot6.png) 
<br/><br/>

## Step 1.2: Please fill “Instance Details” as below:

### 1.2.1: Region:

Definition:   Choose the Azure region that’s right for you and your customers. Not every resource is available in every region.  
Example: East US

![Diagram - Custom vision Market place path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/linker/factory-ai-vision/assets/Tutorial_ArmTemplate_Deployment_Screenshot7.png) 
<br/><br/>

### 1.2.2: Device Architecture: 
Definition:   Specify the Architecture of the Edge Device. Currently supported values are “X86” and “ARM64”. 
Example: X86 or ARM64

![Diagram - Custom vision Market place path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/linker/factory-ai-vision/assets/Tutorial_ArmTemplate_Deployment_Screenshot8.png) 
<br/><br/>

### 1.2.3: Module Runtime: 
Definition:   Select value for Runtime for detector module on Edge Device.  
•	Set it to “CPU” to use if CPU to run detector module, or to use vpu set it to “MOVIDIUS“

![Diagram - Custom vision Market place path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/feat/cascade-dev/factory-ai-vision/assets/module%20runtime_20210904.png?raw=true) 
<br/><br/>


### 1.2.4: Video Capture Module: 
Definition:   Select video capture module to deal with the media source.  
•	Azure Video Analyzer (AVA): is a series from Microsoft that enables developers to capture, record, analyze live video and publish the results (video  and /or video analytics) to Azure services (in the cloud and/or the edge) 
•	OpenCV: is an open source library that includes several hundreds of computer vision Algorithm.

![Diagram - Custom vision Market place path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/linker/factory-ai-vision/assets/Tutorial_ArmTemplate_Deployment_Screenshot10-2.png) 
<br/><br/>

### 1.2.5: IOT HUB Name: 
Definition:   Enter the Name of Existing IOT Hub learn more from link

https://portal.azure.com/#@linkernetworks.com/resource/subscriptions/091725d9-aeba-4638-8faf-d0e81a03a93d/resourceGroups/customvision/providers/Microsoft.Devices/IotHubs/customvision/Overview

Example: customvision

![Diagram - Custom vision Market place path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/linker/factory-ai-vision/assets/Tutorial_ArmTemplate_Deployment_Screenshot11.png) 
<br/><br/>


### 1.2.6: Edge Device Name: 
Definition:   Enter the existing IOT Hub Edge Device. learn more from link

https://portal.azure.com/#@linkernetworks.com/resource/subscriptions/091725d9-aeba-4638-8faf-d0e81a03a93d/resourceGroups/customvision/providers/Microsoft.Devices/IotHubs/customvision/EdgeExplorer

Example: cam5

![Diagram - Custom vision Market place path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/linker/factory-ai-vision/assets/Tutorial_ArmTemplate_Deployment_Screenshot12.png) 
<br/><br/>


### 1.2.7: Custom Vision Name: 
Definition:   Enter the existing CustomVision service. learn more from link 

https://www.customvision.ai/projects
Example: factoryai

![Diagram - Custom vision Market place path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/linker/factory-ai-vision/assets/Tutorial_ArmTemplate_Deployment_Screenshot13.png) 
<br/><br/>

### 1.2.8: Edge Token: 
Definition:   Enter the token of existing AVA Edge Module 
1. create AVA on Azure
2. Add Edge Module
  : Paste the Edge Token
  

learn more from link 

https://azure.microsoft.com/en-us/products/video-analyzer/

## 1.3: After Filled above fields as definition we will have below two filled scenario 
### 1.3.1: When Video Capture Module = AVA

![Diagram - Custom vision Market place path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/linker/factory-ai-vision/assets/Tutorial_ArmTemplate_Deployment_Screenshot20-2.png) 
<br/><br/>

### •	Then click “Review + Create”

### 1.3.2: When Video Capture Module = OpenCV

![Diagram - Custom vision Market place path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/linker/factory-ai-vision/assets/Tutorial_ArmTemplate_Deployment_Screenshot21-2.png) 
<br/><br/>

### •	Then click “Review + Create”  
1.4: After click “Review + Create” in step 1.3 Deployment Process will as below screen

![Diagram - Custom vision Market place path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/linker/factory-ai-vision/assets/Tutorial_ArmTemplate_Deployment_Screenshot22.png) 
<br/><br/>

•	Press “Create” for finish the deployment.  
Note: The Installation will take some time. Please wait for couple of minutes to complete the installation. 
You can check the deployment on the Azure portal.

![Diagram - Custom vision Market place path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/linker/factory-ai-vision/assets/Tutorial_ArmTemplate_Deployment_Screenshot23.png) 
<br/><br/>

### •	Press “Go to Resource Group” to get selected “Edge Device Name” to get the IP address. 
For example: Edge Device Name = cam5

![Diagram - Custom vision Market place path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/linker/factory-ai-vision/assets/Tutorial_ArmTemplate_Deployment_Screenshot24.png) 
<br/><br/>


### •	Press Edge device Name “cam 5” to get selected get the IP address.

![Diagram - Custom vision Market place path](https://github.com/linkernetworks/azure-intelligent-edge-patterns/raw/linker/factory-ai-vision/assets/Tutorial_ArmTemplate_Deployment_Screenshot25.png) 
<br/><br/>


## 1.5: Open Your Browser, Connect to Public IP Address: Port 8181 
       Example:  https://168.63.246.174:8181

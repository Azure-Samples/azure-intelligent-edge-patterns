# Retail Experience Deployment Guide

<!-- TOC -->

- [Retail Experience Deployment Guide](#retail-experience-deployment-guide)
  - [Prerequisites](#prerequisites)
  - [Deploying Azure Resources](#deploying-azure-resources)
  - [Setup Azure Stack Edge Device](#Setup-&-Activate-the-Azure-Stack-Edge-Device)
  - [Network Setup](#network-setup)
  - [Configure Compute for Azure Stack Edge](#Configure-Compute-for-Azure-Stack-Edge-Device)
  - [Deploy Compute Modules](#deploy-compute-modules)
  - [SQL Database Setup](#sql-database-setup)
  - [UX Setup](#ux-setup)

<!-- /TOC -->

## Prerequisites
- Access to a Microsoft Azure subscription.

- An edge compute device. It is recommended to use an Azure Stack Edge device to run the solution. You can request a device by following the instructions listed [here](https://docs.microsoft.com/en-us/azure/databox-online/data-box-edge-deploy-prep).

- Preview access to Microsoft Azure Cognitive Services Containers. Follow the instructions [here](https://docs.microsoft.com/en-us/azure/cognitive-services/face/face-how-to-install-containers) to obtain the Microsoft Cognitive Services Containers.
  - Required Cognitive Services Containers:
    - Face
    - Text to Speech
    - Speech to Text
    - LUIS

- You will need to provide your own IP camera to run the solution. We used the cameras located [here](https://www.amazon.com/gp/product/B01H2JFE5W/ref=ppx_yo_dt_b_search_asin_title?ie=UTF8&psc=1), but any IP based camera with motorized PTZ and RTSP functionality should work.

- Access to your router's DHCP reservation functionality for assigning static IP addresses


## Deploying Azure Resources

1. Clone this GitHub repository.

1. Follow the Azure Deployment Instructions located [here](./ARMtemps/README.md).

## Setup & Activate the Azure Stack Edge Device

1. Log into the [Azure portal](https://portal.azure.com).

1. Navigate to the resource group you created in the [Deploying Azure Resources](#deploying-azure-resources) step above.

1. Select the resource named `retailASE`. 

1. Follow the Azure Stack Edge setup instructions [here](https://docs.microsoft.com/en-us/azure/databox-online/data-box-edge-deploy-prep#get-the-activation-key) starting at "Get the activation key". Continue following instructions until the [Connect, set up, activate](https://docs.microsoft.com/en-us/azure/databox-online/data-box-edge-deploy-connect-setup-activate) page is complete.

## Network Setup
1. Assign static IP addresses to cameras and Azure Stack Edge. Please refer to your router's documentation on DHCP address reservation to configure.

1. Take note of which IP addresses were assigned to each device. This will be used in later steps.

Note: Delete any unused Azure Stack Edge Resources that might have been created for shipping.

## Configure Compute for Azure Stack Edge Device

1. Return to the Azure portal page with the retailASE resource selected. 

1. On the Overview page under Compute click Get started.

1. On the new page in box number two click Configure.

1. Select the Existing IoT Hub option. Pick the IoT Hub that was created in the Deploy Azure Assets step. Make note of it's name for later steps and click save.

## Deploy Compute Modules

1. Following the instructions [here](https://docs.microsoft.com/en-us/azure/cognitive-services/face/face-how-to-install-containers) to obtain the Microsoft Cognative Services Containers.

1. Build the docker images located in the IgniteSolutions folder.

1. Push these images to the container registry in your resource group.

1. Follow the Ignite Containers Deployment Guide located [here](IgniteSolution/README.md).

## SQL Database Setup

1. Follow the SQL Server Backend Setup guide located [here](sql-backend/README.md).

1. Use Visual Studio Zip deployment to load function1 into the Azure function app.
    1. Connect to the project repo on Visual Studio.
    1. Open the sln file [here](services/FunctionAppArrivals/FunctionAppArrivals.sln)
    1. Right click and publish solution.
    1. Before finalizing publication make sure the database connection string used is the string for the database from the previous step.

## UX Setup

1. Follow the Ignite Demo UX guide located [here](IgniteDemoApp/README.md)

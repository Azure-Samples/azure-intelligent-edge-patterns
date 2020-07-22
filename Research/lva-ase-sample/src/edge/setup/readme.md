## STEP 2: SETTING UP AZURE RESOURCES FOR LIVE VIDEO ANALYTICS ON IOT EDGE ##

This folder contains a bash script and other files listed below, which can be used to create and setup Azure resources required to run the quickstarts and other samples for Live Video Analytics on IoT Edge.

- [setup.sh](https://github.com/julialieberman/azure-intelligent-edge-patterns/blob/t-jull-lvasample/Research/lva-ase-sample/src/edge/setup/setup.sh) is bash script intended to be use in [Azure Cloud Shell](http://shell.azure.com/). This script makes use of the other files in the folder.
- [LVAEdgeUserRoleDefinition.json] defines a [custom role](https://docs.microsoft.com/azure/role-based-access-control/custom-roles) so that the Live Video Analytics on Edge module can use a service principal with minimal privileges when making calls to Azure Media Services

## Prerequisites
* Azure subscription with __owner__ level privileges
* Resource group on the subscription with the following resources
    * Azure Stack Edge device - set up with compute-enabled shares
    * Storage account
    * IoT Hub associated with your edge device

## Running the script
1. Browse to https://shell.azure.com.
2. If this is the first time you are using Cloud Shell, you will prompted to select a subscription to create a storage account and Microsoft Azure Files share. Select "Create storage" to create a storage account for storing your Cloud Shell session information. This storage account is separate from the one the script will create to use with your Azure Media Services account.
3. Select "Bash" as your environment in the drop-down on the left-hand side of the shell window.
4. Run the following commands

```
mkdir lva-sample-on-ase
cd lva-sample-on-ase
curl -X GET https://raw.githubusercontent.com/julialieberman/azure-intelligent-edge-patterns/t-jull-lvasample/Research/lva-ase-sample/src/edge/setup/setup.sh > setup.sh
chmod +x setup.sh
./setup.sh
```

The script will prompt you for a few things, including the subscription, the resource group, storage account name, a container registry name, and a media services account name. If you already have such resources in the resource group, the script will find them for you and make sure you want to use those.

When this is done running, expand the {} brackets in the upper left of the Cloud Shell to see your files.

An error may be thrown when starting your streaming endpoint. If this happens (the script should still finish!) then run the following command from the cloud shell. Replace $RESOURCE_GROUP and $AMS_ACCOUNT with the name of your resource group and azure media services account
``` az ams streaming-endpoint start --resource-group $RESOURCE_GROUP --account-name $AMS_ACCOUNT -n default --no-wait" ```

After the script finishes, you will have certain Azure resources deployed in the Azure subscription, including:

* Container registry
* Azure Media Services account
* Service principal with custom defined role


## Copy files from the cloud shell to your local files
Open up your local cloned repository in VS Code. You will create two new files, the contents of which you generated in the cloud shell.

#### appsettings.json

* Create a file named appsettings.json in this folder (src/cloud-to-device-console-app). The setup script you ran in the cloud shell creates this file for you. Copy and paste the contents into the local file you create here. 

```JSON
{
    "IoThubConnectionString" : "",
    "deviceId" : "",
    "moduleId" : ""
}
```

* **IoThubConnectionString** - Refers to the connection string of your IoT Hub
* **deviceId** - Refers to your Azure Stack Edge device id (registered with your IoT Hub. This may add -edge at the end of the name, this is ok!)
* **moduleId** - Refers to the module id of Live Video Analytics on IoT Edge module (when deployed to the IoT Edge device)

#### .env
* Create a file named .env in src/edge folder. When you ran the script in the cloud shell, you generated this file. Copy and paste the contents from your cloud shell .env file into the local one you create here. 
* Change the INPUT_VIDEO_FOLDER_ON_DEVICE, OUTPUT_VIDEO_FOLDER_ON_DEVICE, and APPDATA_FOLDER_ON_DEVICE to point to your compute-enabled shares on your device (i.e. INPUT_VIDEO_FOLDER_ON_DEVICE="localshare1"). If doing this locally, you may set all three values to the same local share. The INPUT must point to the share where you placed the camera-300s.mkv video!

The .env file should follow this format:

```env
SUBSCRIPTION_ID="<your Azure subscription id>"
RESOURCE_GROUP="<your resource group name>"
AMS_ACCOUNT="<name of your Media Services account>"
IOTHUB_CONNECTION_STRING="<IoT Hub connection string>"
AAD_TENANT_ID="<your AAD tenant ID>"
AAD_SERVICE_PRINCIPAL_ID="<your AAD service principal id>"
AAD_SERVICE_PRINCIPAL_SECRET="<your AAD service principal secret>"
INPUT_VIDEO_FOLDER_ON_DEVICE="<a folder on your edge device with MKV files, used by RTSP simulator>"
OUTPUT_VIDEO_FOLDER_ON_DEVICE="<a folder on your edge device used for recording video clips>"
APPDATA_FOLDER_ON_DEVICE="<a folder on your edge device used for storing application data>"
CONTAINER_REGISTRY_USERNAME_myacr="<user name for your Azure Container Registry>"
CONTAINER_REGISTRY_PASSWORD_myacr="<password for the registry>"
```

#### Next Steps
Proceed to the final phase, STEP 3: 
Follow the directions in the cloud-to-device-console-app [readme](https://github.com/julialieberman/azure-intelligent-edge-patterns/tree/t-jull-lvasample/Research/lva-ase-sample/src/cloud-to-device-console-app/readme.md) to deploy and run the sample.

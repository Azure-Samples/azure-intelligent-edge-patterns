# STEP 2: SETTING UP AZURE RESOURCES FOR LIVE VIDEO ANALYTICS ON IOT EDGE #

This folder contains a bash script and other files listed below, which can be used to create and setup Azure resources required to run the quickstarts and other samples for Live Video Analytics on IoT Edge.

- [setup.sh](https://github.com/julialieberman/azure-intelligent-edge-patterns/blob/t-jull-lvasample/Research/lva-ase-sample/src/setup/setup.sh) is bash script intended to be use in [Azure Cloud Shell](http://shell.azure.com/). This script makes use of the other files in the folder, creates all the necessary resources to run LVA, and run the entire sample in the Azure Cloud Shell
- [LVAEdgeUserRoleDefinition.json] defines a [custom role](https://docs.microsoft.com/azure/role-based-access-control/custom-roles) so that the Live Video Analytics on Edge module can use a service principal with minimal privileges when making calls to Azure Media Services
- [invokeMethodsHelper.sh](https://github.com/julialieberman/azure-intelligent-edge-patterns/blob/t-jull-lvasample/Research/lva-ase-sample/src/setup/invokeMethodsHelper.sh) Helper methods for the setup.sh script
- jsonfiles folder with the json objects that will be used when invoking direct methods on the Live Video Analytics module

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
curl -X GET https://raw.githubusercontent.com/julialieberman/azure-intelligent-edge-patterns/t-jull-lvasample/Research/lva-ase-sample/src/setup/setup.sh > setup.sh
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

It will also deploy the modules to your ASE device, and run the sample. Then you're done! You successfully ran LVA on the ASE!

# NEXT STEPS #

## Run again! ##
The setup.sh script should print out the exact command you must use to run the sample again without redoing all the setup. You will run the command from the Azure Cloud Shell:
./invokeMethodsHelper.sh IOTHUBNAME EDGE_DEVICE-edge

## Add multiple cameras by creating multiple graph instances ##
* Go to the jsonfiles/ folder and create duplicate files of instanceset.json, instanceactivate.json, instancedeactivate.json, and instancedelete.json, let's say you call them instanceset2.json, instancedelete2.json, etc.
* You will need a new name for this graph instance. In each new file, provide this new value for the "name" field
* In instanceset2.json provide the second camera's RTSP URL, and username/password (if needed) where indicated ![topology set image](https://github.com/julialieberman/azure-intelligent-edge-patterns/blob/t-jull-lvasample/Research/lva-ase-sample/src/setup/assets/instanceset.PNG)
* In invokeMethodsHelper.sh change the current lines:
```
starters=("topologylist" "instancelist" "topologyset" "instanceset")
activators=("instanceactivate" "instancelist")
cleanup=("instancedeactivate" "instancedelete" "instancelist" "topologydelete" "topologylist")
```
to include your new files. For example:

```
starters=("topologylist" "instancelist" "topologyset" "instanceset" "instanceset2" )
activators=("instanceactivate" "instanceactivate2" "instancelist")
cleanup=("instancedeactivate" "instancedeactivate2" "instancedelete" "instancedelete2" "instancelist" "topologydelete" "topologylist")
```
* Then, from the Azure Cloud Shell, assuming you are still in the the same directory (lva-sample-on-ase) run the following command:
```
./invokeMethodsHelper.sh IOTHUB-NAME EDGE-DEVICE-NAME
```
The IOTHUB-NAME and EDGE-DEVICE-NAME should be your values. When you finished running the setup.sh script it would have told you the exact command to run to do this, feel free to copy from there!

## Change from using local shares to running this in the cloud, and view output in Media Services Account ##
* Change your topologyset.json file (jsonfiles/topologyset.json), replacing lines 146-157 that contain the File Sink, to the following:
    ```
    {
        "@type": "#Microsoft.Media.MediaGraphAssetSink",
        "name": "assetSink",
        "assetNamePattern": "lva-sample-assets-LVAEdge-${System.DateTime}",
        "segmentLength": "PT30S",
        "LocalMediaCacheMaximumSizeMiB": "2048",
        "localMediaCachePath": "/var/lib/azuremediaservices/tmp/",
        "inputs": 
        [
            {
                "nodeName": "signalGateProcessor"
            }
        ]
    },
    ```
* This will have you use an Asset Sink instead of a File Sink. Read about the various Media Graph nodes [here](https://docs.microsoft.com/en-us/azure/media-services/live-video-analytics-edge/media-graph-concept#sources-processors-and-sinks)
* Run invokeMethodsHelper.sh from the Azure Cloud Shell again as previously instructed (see Run Again!)
* View the output files after running, by going to the Azure Portal, going to your Media Services Account, in the navigation on the lefthand side scroll down to where it says "Assets (new)" under __Media Services__
    * Click on one of the older assets that was recently created
    * Scroll down and click on "Create new" under Streaming URL
    * Leave the default values as they are, and click Add
    * Wait a minute or two for the content to load. You should now be able to see the video clip!
    * If there are problems with the video, try repeating the last 4 steps on another recently created asset

## Change the AI model you're using: ##
* To keep things simple, we won't rename the new model. Open the edge-deployment/deployment.yolov3.template.json file in your Azure Cloud Shell.
* Around line 11, you should see "registryCredentials": {}
    * Inside of the brackets, enter the following:
    ```
    "$CONTAINER_REGISTRY_USERNAME_myacr": 
    {
        "username": "Your_CR_Username",
        "password": "Your_CR_Password",
        "address": "Your_CR_Server_Address"
    }
    ``` 
    * If using an Azure Container Registry, your server address would look like __ContainerRegistryName.azurecr.io__
* Scroll down to ~line 48 where it says "yolov3" : {...}
* Change the "image" value from "mcr.microsoft.com/lva-utilities/yolov3-onnyx:1.0" to your desired image
* Save your file
* Using your IoTHub and Edge Device names, run the following command:
```
az iot edge set-modules --hub-name IOTHUB --device-id EDGE_DEVICE-edge --content 'edge-deployment/deployment.yolov3.template.json'
```
* Note that you need to add -edge onto your EDGE_DEVICE name, so if your hub is called "myhub" and your device is called "myAzureStackEdge" you would execute the command:
```
az iot edge set-modules --hub-name "myhub" --device-id "myAzureStackEdge-edge" --content "edge-deployment/deployment.yolov3.template.json"
```
* Finally, after a successful deployment, run invokeMethodsHelper.sh again as previously instructed
## STEP 2: SETTING UP AZURE RESOURCES FOR LIVE VIDEO ANALYTICS ON IOT EDGE ##

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
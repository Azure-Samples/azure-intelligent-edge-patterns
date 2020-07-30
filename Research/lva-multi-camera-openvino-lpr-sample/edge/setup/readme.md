# Setting up Azure resources for Live Video Analytics on IoT Edge

This folder contains a bash script and other files listed below, which can be used to create and setup Azure resources required to run the quickstarts and other samples for Live Video Analytics on IoT Edge.

- [setup.sh]() is bash script intended to be use in [Azure Cloud Shell](http://shell.azure.com/). This script makes use of the other files in the folder.
- [cloud-init.yml]() helps setup an Azure Linux VM as an IoT Edge device, and copies some required files into the VM. You can learn about the syntax [here](https://docs.microsoft.com/azure/virtual-machines/linux/using-cloud-init).
- [deploy.json] is an [Azure Resource Management template](https://docs.microsoft.com/azure/templates/) for deploying various resources in Azure required by the samples
- [deployment.template.json] is a template the script uses to generate a [deployment manifest](https://docs.microsoft.com/azure/iot-edge/module-composition), which can be used for deploying Live Video Analytics on IoT Edge module (and others)
- [LVAEdgeUserRoleDefinition.json] defines a [custom role](https://docs.microsoft.com/azure/role-based-access-control/custom-roles) so that the Live Video Analytics on Edge module can use a service principal with minimal privileges when making calls to Azure Media Services

You can get to the script via this redirect: https://aka.ms/lva-edge/setup-resources-for-samples

## Running the script
1. Browse to https://shell.azure.com.
1. If this is the first time you are using Cloud Shell, you will prompted to select a subscription to create a storage account and Microsoft Azure Files share. Select "Create storage" to create a storage account for storing your Cloud Shell session information. This storage account is separate from the one the script will create to use with your Azure Media Services account.
1. Select "Bash" as your environment in the drop-down on the left-hand side of the shell window.
1. Run the following command

    ```
    bash -c "$(curl -sL https://aka.ms/lva-edge/setup-resources-for-samples)"
    ```
    
After the script finishes, you will have certain Azure resources deployed in the Azure subscription, including:

* IoT Hub
* Storage account
* Azure Media Services account
* Linux VM in Azure, with [IoT Edge runtime](https://docs.microsoft.com/azure/iot-edge/how-to-install-iot-edge-linux) installed



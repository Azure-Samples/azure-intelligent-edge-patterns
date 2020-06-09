# Prerequiste 
1. For runing on CPU : A x64 ubuntu machine with docker + Azure Iot edge working 
2. For runnign on GPU : Azure Stack Edge 
                        OR
                        Azure/Azure Stack Hub NCv2 VM with Nvidia Docker + Nvidia driver + Azure Iot Edge 



# Vision on Edge Installer

To install the Vision on Edge Solution Accelerator, the following prerequisites are required...

1. You must have the Azure CLI installed on your system.  See [this document](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest) for information on how to install the CLI
2. You must have an Azure subscription
3. That subscription must contain an IoT Hub with a registered IoT Edge device (generally this will be an Azure Stack Edge Device), port 5000 and 8080 need to be opened in the IoT Edge device/vm
4. If you choose to deploy a new instance of Custom Vision service, this installer will try to install the free version.  If you have an existing free version, install will fail.

To install the solution on a PC running Windows, unpack the installation zip, navigate to the directory containing the unziped files in a terminal, and run the vision-on-edge-install.cmd script.

To install the solution on a Mac, or a PC running Linux, unpack the installation zip, navigate to the directory containing the unziped files in a terminal, and run the vision-on-edge-install.sh script.

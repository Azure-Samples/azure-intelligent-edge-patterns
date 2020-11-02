

# Quickstart: Deploy your first IoT Edge module to a virtual Linux device

Test out Azure IoT Edge in this quickstart by deploying containerized code to a virtual Linux IoT Edge device. IoT Edge allows you to remotely manage code on your devices so that you can send more of your workloads to the edge. For this quickstart, we recommend using an Azure virtual machine for your IoT Edge device, which allows you to quickly create a test machine with the IoT Edge service installed and then delete it when you're finished.

In this quickstart you learn how to:

* Create an IoT Hub.
* Register an IoT Edge device to your IoT hub.
* Install and start the IoT Edge runtime on your virtual device.


![Diagram - Quickstart architecture for device and cloud](https://github.com/MicrosoftDocs/azure-docs/blob/master/articles/iot-edge/media/quickstart/install-edge-full.png)

This quickstart walks you through creating a Linux virtual machine that's configured to be an IoT Edge device. Then, you deploy a module from the Azure portal to your device. The module used in this quickstart is a simulated sensor that generates temperature, humidity, and pressure data. The other Azure IoT Edge tutorials build upon the work you do here by deploying additional modules that analyze the simulated data for business insights.

If you don't have an active Azure subscription, create a [free account](https://azure.microsoft.com/free) before you begin.

## Use Azure Cloud Shell

Azure hosts Azure Cloud Shell, an interactive shell environment that you can use through your browser. You can use either Bash or PowerShell with Cloud Shell to work with Azure services. You can use the Cloud Shell preinstalled commands to run the code in this article without having to install anything on your local environment.

To start Azure Cloud Shell:

| Option | Example/Link |
|-----------------------------------------------|---|
| Select **Try It** in the upper-right corner of a code block. Selecting **Try It** doesn't automatically copy the code to Cloud Shell. | ![Example of Try It for Azure Cloud Shell](https://github.com/MicrosoftDocs/azure-docs/blob/master/includes/media/cloud-shell-try-it/hdi-azure-cli-try-it.png) |
| Go to [https://shell.azure.com](https://shell.azure.com), or select the **Launch Cloud Shell** button to open Cloud Shell in your browser. | [![Launch Cloud Shell in a new window](https://github.com/MicrosoftDocs/azure-docs/blob/master/includes/media/cloud-shell-try-it/hdi-launch-cloud-shell.png)](https://shell.azure.com) |
| Select the **Cloud Shell** button on the menu bar at the upper right in the [Azure portal](https://portal.azure.com). | ![Cloud Shell button in the Azure portal](https://github.com/MicrosoftDocs/azure-docs/blob/master/includes/media/cloud-shell-try-it/hdi-cloud-shell-menu.png) |

To run the code in this article in Azure Cloud Shell:

1. Start Cloud Shell.

1. Select the **Copy** button on a code block to copy the code.

1. Paste the code into the Cloud Shell session by selecting **Ctrl**+**Shift**+**V** on Windows and Linux or by selecting **Cmd**+**Shift**+**V** on macOS.

1. Select **Enter** to run the code.


You use the Azure CLI to complete many of the steps in this quickstart, and Azure IoT has an extension to enable additional functionality.

Add the Azure IoT extension to the Cloud Shell instance.

   ```azurecli-interactive
   az extension add --name azure-iot
   ```
> [!NOTE]
> This article uses the newest version of the Azure IoT extension, called `azure-iot`. The legacy version is called `azure-cli-iot-ext`.You should only have one version installed at a time. You can use the command `az extension list` to validate the currently installed extensions.
>
> Use `az extension remove --name azure-cli-iot-ext` to remove the legacy version of the extension.
>
> Use `az extension add --name azure-iot` to add the new version of the extension. 
>
> To see what extensions you have installed, use `az extension list`.



## Prerequisites

Cloud resources:

* A resource group to manage all the resources you use in this quickstart. We use the example resource group name **IoTEdgeResources** throughout this quickstart and the following tutorials.

   ```azurecli-interactive
   az group create --name IoTEdgeResources --location westus2
   ```

## Create an IoT hub

Start the quickstart by creating an IoT hub with Azure CLI.

![Diagram - Create an IoT hub in the cloud](https://github.com/MicrosoftDocs/azure-docs/blob/master/articles/iot-edge/media/quickstart-linux/create-iot-hub.png)

The free level of IoT Hub works for this quickstart. If you've used IoT Hub in the past and already have a hub created, you can use that IoT hub.

The following code creates a free **F1** hub in the resource group **IoTEdgeResources**. Replace `{hub_name}` with a unique name for your IoT hub. It might take a few minutes to create an IoT Hub.

   ```azurecli-interactive
   az iot hub create --resource-group IoTEdgeResources --name {hub_name} --sku F1 --partition-count 2
   ```

   If you get an error because there's already one free hub in your subscription, change the SKU to **S1**. Each subscription can only have one free IoT hub. If you get an error that the IoT Hub name isn't available, it means that someone else already has a hub with that name. Try a new name.

## Register an IoT Edge device

Register an IoT Edge device with your newly created IoT hub.

![Diagram - Register a device with an IoT Hub identity](https://github.com/MicrosoftDocs/azure-docs/blob/master/articles/iot-edge/media/quickstart-linux/register-device.png)

Create a device identity for your IoT Edge device so that it can communicate with your IoT hub. The device identity lives in the cloud, and you use a unique device connection string to associate a physical device to a device identity.

Since IoT Edge devices behave and can be managed differently than typical IoT devices, declare this identity to be for an IoT Edge device with the `--edge-enabled` flag.

1. In the Azure Cloud Shell, enter the following command to create a device named **myEdgeDevice** in your hub.

   ```azurecli-interactive
   az iot hub device-identity create --device-id myEdgeDevice --edge-enabled --hub-name {hub_name}
   ```

   If you get an error about iothubowner policy keys, make sure that your Cloud Shell is running the latest version of the azure-iot extension.

2. View the connection string for your device, which links your physical device with its identity in IoT Hub. It contains the name of your IoT hub, the name of your device, and then a shared key that authenticates connections between the two. We'll refer to this connection string again in the next section when you set up your IoT Edge device.

   ```azurecli-interactive
   az iot hub device-identity connection-string show --device-id myEdgeDevice --hub-name {hub_name}
   ```

   ![View connection string from CLI output](https://github.com/MicrosoftDocs/azure-docs/blob/master/articles/iot-edge/media/quickstart/retrieve-connection-string.png)

## Configure your IoT Edge device

Create a virtual machine with the Azure IoT Edge runtime on it.

![Diagram - Start the runtime on device](https://github.com/MicrosoftDocs/azure-docs/blob/master/articles/iot-edge/media/quickstart-linux/start-runtime.png)

### Deploy the IoT Edge device


This section uses an Azure Resource Manager template to create a new virtual machine and install the IoT Edge runtime on it. If you want to use your own Linux device instead, you can follow the installation steps in [Install the Azure IoT Edge runtime](https://docs.microsoft.com/en-us/azure/iot-edge/how-to-install-iot-edge?tabs=linux), then return to this quickstart.


## ARM Template to deploy IoT Edge enabled VM

ARM template to deploy a VM with IoT Edge pre-installed (via cloud-init)

<a href="https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fazure%2Fiotedge-vm-deploy%2Fmaster%2FedgeDeploy.json" target="_blank">
    <img src="https://raw.githubusercontent.com/Azure/azure-quickstart-templates/master/1-CONTRIBUTION-GUIDE/images/deploytoazure.png" />
</a>



The IoT Edge runtime is deployed on all IoT Edge devices. It has three components. The *IoT Edge security daemon* starts each time an IoT Edge device boots and bootstraps the device by starting the IoT Edge agent. The *IoT Edge agent* facilitates deployment and monitoring of modules on the IoT Edge device, including the IoT Edge hub. The *IoT Edge hub* manages communications between modules on the IoT Edge device, and between the device and IoT Hub.

During the runtime configuration, you provide a device connection string. This is the string that you retrieved from the Azure CLI. This string associates your physical device with the IoT Edge device identity in Azure.

## please follow instruction to open network port 8181

Go to https://portal.azure.com/#home. Click on Virtual Machines. If you have not created one, hit Add to create your virtual Machine. 

![Diagram - Go to Azure Portal to create Virtual Machine](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/go%20to%20azure%20portal_1.png)

On the list of devices, click on the device that you would like to deploy.

![Diagram - Create Virtual Machine and go to networking](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/go%20to%20azure%20portal_2.png)
Go  to  Networking.
![Diagram - Create Virtual Machine and go to networking](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/go%20to%20azure%20portal_3.png)

Check if you have opened the 8181 port. If not, please click on 'Add Inbound Port Rule'. 

![Diagram - Create Virtual Machine and go to networking](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/go%20to%20azure%20portal_4.png)
<br/>
<br/>
<br/>
And fill out Destination port ranges and port Name. After this, you will see a pop up telling you that it’s creating security rule ‘Port_8181’. 
![Diagram - Create Virtual Machine and go to networking](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/go%20to%20azure%20portal_5.png)
<br/>
<br/>
<br/>

![Diagram - Create Virtual Machine and go to networking](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/go%20to%20azure%20portal_6.png)
<br/>
<br/>
<br/>
![Diagram - Create Virtual Machine and go to networking](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/go%20to%20azure%20portal_7.png)

# Vision on Edge Installer

To install the Vision on Edge Solution Accelerator using the installation script, the following prerequisites are required...

1. You should have the latest version of the Azure CLI installed on your system.  See [this document](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest) for information on how to install or update the CLI
2. You must have an Azure subscription
3. Your subscription must contain an IoT Hub with a registered IoT Edge device (generally this will be an Azure Stack Edge Device). Port 5000 and 8080 need to be available in the IoT Edge device

 _**Important**_: If you choose to deploy a new instance of Custom Vision service, this installer will try to install the free version.  If you have an existing free version, installation will fail

 To install the solution:

* The installer and supporting files must be copied to your local machine. Either clone the repository locally, or download the appropriate zip file for your platform from the Installers directory and extract the files.

* For a PC running Windows, navigate to the directory containing the installation files in a terminal and run the vision-on-edge-install.cmd script.

 \- or -

* For a Mac, or a PC running Linux, navigate to the directory containing the installation files in a terminal and run the vision-on-edge-install.sh script.
* Now you can access the product GUI, open browser youripedgedeviceip:8080   eg. http://52.1.1.1:8080/


# Build the docker and deploy by Visual Studio Code

Before installation, please make sure you have docker installed in your local environment, and at least one iot edge is connected to your iot hub

1. To enable training process, enter your custom vision training key `TRAINING_KEY` and endpoint `ENDPOINT` in `factory-ai-vision/EdgeSolution/modules/WebModule/backend/config.py`
2. To enable app insight, enter your instrumental key `APP_INSIGHT_INST_KEY` in `factory-ai-vision/EdgeSolution/modules/WebModule/backendconfigs/app_insight.py` and set `APP_INSIGHT_ON` as `True`
3. Open Visual Studio Code, right click on `factory-ai-vision/EdgeSolution/deployment.gpu.template.json` and choose "Build and Push IoT Edge Solution" it will start to build the docker container. It takes more than 10 mins to finish if it's your first time to build
4. In Visual Studio Code, right click on `factory-ai-vision/EdgeSolution/config/deployment.gpu.amd64.json` and choose "Create Single Deployment for Single Device" and then pick the edge from the list to deploy



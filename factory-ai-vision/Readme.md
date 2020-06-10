# Vision on Edge Installer

To install the Vision on Edge Solution Accelerator, the following prerequisites are required...

1. You must have the Azure CLI installed on your system.  See [this document](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest) for information on how to install the CLI
2. You must have an Azure subscription
3. That subscription must contain an IoT Hub with a registered IoT Edge device (generally this will be an Azure Stack Edge Device), port 5000 and 8080 need to be opened in the IoT Edge device/vm
4. If you choose to deploy a new instance of Custom Vision service, this installer will try to install the free version.  If you have an existing free version, install will fail.

To install the solution on a PC running Windows, unpack the installation zip, navigate to the directory containing the unziped files in a terminal, and run the vision-on-edge-install.cmd script.

To install the solution on a Mac, or a PC running Linux, unpack the installation zip, navigate to the directory containing the unziped files in a terminal, and run the vision-on-edge-install.sh script.


# Build the docker and deploy by Visual Studio Code

Before installation, please make sure you have docker installed in your local environment, and at least one iot edge is connected to your iot hub

1. To enable training process, enter your custom vision training key `TRAINING_KEY` and endpoint `ENDPOINT` in `factory-ai-vision/EdgeSolution/modules/WebModule/backend/config.py`
2. To enable app insight, enter your instrumental key `APP_INSIGHT_INST_KEY` in `factory-ai-vision/EdgeSolution/modules/WebModule/backendconfigs/app_insight.py` and set `APP_INSIGHT_ON` as `True`
3. Open Visual Studio Code, right click on `factory-ai-vision/EdgeSolution/deployment.gpu.template.json` and choose "Build and Push IoT Edge Solution" it will start to build the docker container. It takes more than 10 mins to finish if it's your first time to build
4. In Visual Studio Code, right click on `factory-ai-vision/EdgeSolution/config/deployment.gpu.amd64.json` and choose "Create Single Deployment for Single Device" and then pick the edge from the list to deploy


# Query on App Insight to see the user usage statistics

1. Go to App Insight, click Usage -> Users, click Pin to ping it to dashboard
2. Go to Logs, type this query and run:

    customEvents
    | where name == 'train'
    | extend images = tolong(customDimensions.images)
    | extend parts = tolong(customDimensions.parts)
    | extend source = tostring(customDimensions.source)
    | summarize train = count(), retrain = count() - 1, parts = sum(images), images = sum(parts) by source

3. Click Pin to ping it to dashboard as well

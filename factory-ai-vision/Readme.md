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
* Now you can access the product startup page by opening the browser at http://youredgedeviceip:8080   eg. http://52.1.1.1:8080/


# Build the docker and deploy by Visual Studio Code

### Prerequisites

Before installation, please make sure you have 
1. Docker installed in your local environment. If you don't have it, please following this documentation <https://docs.docker.com/get-docker/>

2. At least one IoT Edge with Port 8080 and 5000 opended is connected to your Iot Hub. please follow this documentation https://docs.microsoft.com/en-us/azure/iot-edge/quickstart-linux to deploy if you don't have it.

3. An Azure Custom Vision account, you can find your training key here <https://www.customvision.ai/projects#/settings>

4. An Azure Container Registry, please follow this to create your own if you don't have it <https://docs.microsoft.com/en-us/azure/container-registry/>

### Build and Deploy

1. create a `.env` file under directory `factory-ai-vision/EdgeSolution` and put following Azure Container Registry credential in. Your Visual Studio Code will need these credential to push the container later. 

    CONTAINER_REGISTRY_NAME="<YOUR_CONTAINER_REGISTRY_NAME>"
    
    CONTAINER_REGISTRY_USERNAME="<YOUR_CONTAINER_REGSITRY_USERNAME>"
    
    CONTAINER_REGISTRY_PASSWORD="<YOUR_CONTAINER_REGISTRY_PASSWORD>"
    

2. (optional) Enter your custom vision training key `TRAINING_KEY` and endpoint `ENDPOINT` in `factory-ai-vision/EdgeSolution/modules/WebModule/backend/config.py`. You can copy that from your custom vision setting page. If you skip this step, you'll need to enter this after the whole deployment processes are done.


3. Open Visual Studio Code, to build the GPU version, right click on `factory-ai-vision/EdgeSolution/deployment.gpu.template.json` and choose "Build and Push IoT Edge Solution" it will start to build the docker container. It takes more than 10 mins to finish if it's your first time to build. If you want to build the CPU version, use the template file `factory-ai-vision/EdgeSolution/deployment.gpu.template.json` instead.

4. In Visual Studio Code, right click on `factory-ai-vision/EdgeSolution/config/deployment.gpu.amd64.json` (or `factory-ai-vision/EdgeSolution/config/deployment.cpu.amd64.json` if you built CPU version in the last step) and choose "Create Single Deployment for Single Device" and then pick the edge from the list to deploy.

5. Open your browser and connect to `http://<your-edge-ip:8080>`. If you skip step2 then you have to enter your Custom Vision Training Key & Endpoint here.

### Trouble Shooting 

1. If this is the first time you deploy the container to your edge, you might need to wait for more than 10 mins. You can use ssh to connect to your edge and try `sudo docker ps`. You should see following 2 containers running, otherwise, the conatiners aren't downloaded successfully yet :
    YOUR_CONTAINER_REGISTRY_NAME/inferencemodule:x.x.xx-cpuamd64 (or gpu)
    YOUR_CONTAINER_REGISTRY_NAME/visionwebmodule:x.x.xx-cpuamd64
    
2. If the inference & visionweb modules exist but still cannot see the page in 8080 port, check whether 8080 port on your edge is opened.

3. If you can visit the website (in 8080 port) but not see the inference result video after click configuration in the Part Identification page, please check whether your edge's 5000 port is opened




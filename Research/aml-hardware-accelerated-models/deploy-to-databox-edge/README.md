# Azure ML Hardware Accelerated Models - Deploy to Databox Edge
This notebook and sample code showcase the use of Azure ML Hardware Accelerated Models on the Data Box Edge (DBE) machine. [Data Box Edge]((https://docs.microsoft.com/en-us/azure/databox-online/data-box-edge-overview)) is an on-premise server that is enabled with an FPGA. By running the Azure ML AccelContainerImage (a Docker image) on the machine where the input images are being stored, you can address privacy concerns in cases where the images contain sensitive material and process images faster by removing network latency. We will use the Data Box Edge's IoT Hub to deploy the AccelContainerImage with specifications of how to access the FPGA and reap the benefits of hardware accelerated neural network models. 

## Getting Started
These samples assume you are familiar with the Azure ML Hardware Accelerated Models (HAM) product. If not, you can read more about Azure ML FPGA acceleration of models at the resources here:
- [Azure ML Documentation](https://docs.microsoft.com/en-us/azure/machine-learning/service/how-to-deploy-fpga-web-service)
- [PyPi library](https://pypi.org/project/azureml-accel-models/)
- [Python SDK documentation](https://docs.microsoft.com/en-us/python/api/azureml-accel-models/azureml.accel?view=azure-ml-py)
- [Azure Machine Learning notebooks](https://github.com/Azure/MachineLearningNotebooks/tree/master/how-to-use-azureml/deployment/accelerated-models) 


### Prerequisites
* An IoT Edge Device (specifically, the Data Box Edge machine with Compute VM enabled)
    * Follow [steps 1 - 5a](https://docs.microsoft.com/en-us/azure/databox-online/data-box-edge-deploy-prep) to set up your Data Box Edge machine and enable the Linux Compute VM and an associated IoT Hub. This IoT Hub will deploy the AccelContainerImage to the Compute VM. **Note:** In order to use the Azure ML SDK to deploy your model to your IoT Hub, you must create your Data Box Edge resource in the same subscription as your Azure ML Workspace.
* An Azure ML model registered OR a ContainerImage successfully created in your Workspace.
    * For an Accelerated model, you can follow [this notebook](https://github.com/Azure/MachineLearningNotebooks/blob/master/how-to-use-azureml/deployment/accelerated-models/accelerated-models-quickstart.ipynb) through step 3. Step 4 and Step 5 are optional, and will be completed behind the scenes in deployment if not done.

### Quickstart
```
git clone https://github.com/Azure-Samples/aml-hardware-accelerated-models.git
cd aml-hardware-accelerated-models/deploy-to-databox-edge
pip install azureml-accel-models[cpu] # Install AzureML Accelerated Models Python SDK
pip install azure-cli # Install Azure CLI
az extension add --name azure-cli-iot-ext # Add IoT CLI extension
pip install -U jupyter_console # Fix Jupyter dependencies overridden by Azure CLI installation
pip install docker # Install Docker
pip install jupyter
az login
az account set --subscription $SUBSCRIPTION_ID
az configure --defaults group=$RESOURCE_GROUP
jupyter notebook
```

### What if I'm deploying an Azure ML CPU model? 
If you have an Azure ML model that only uses CPU, you can still deploy to Data Box Edge machine. You can follow steps for **Deploying the Accelerated Model**, but you do not have to include the information about how to access the FPGA in the Create Container options. You should still include the 'PortBindings' section, with the ports you want exposed (port 80 or 443) instead of 50051. 

Additionally, for the sample client, the ones included here will not work. You can refer to the documentation [on consuming the CPU webservices](https://docs.microsoft.com/en-us/azure/machine-learning/service/how-to-consume-web-service) and to the [Azure ML notebooks](https://github.com/Azure/MachineLearningNotebooks) you used to create your ContainerImage.

### Deploying the Accelerated Model
To deploy the image to the Data Box Edge machine, we will use the IoT Hub associated with your Linux Compute VM. When a Docker image is deployed through IoT Hub, it is called a 'module' running on the edge device.

- [Deploy using Azure ML Python SDK](deploy-to-edge-using-sdk.ipynb)

    If your Data Box Edge machine is in the same subscription as your Azure ML Workspace, you can use the Azure ML SDK to deploy your model. In this case, all you have to provide is your Azure ML Workspace, your registered model, your IoT Hub name, and your IoT Edge device. In the process of deployment, your model will be converted to the Accelerated format (if not already converted) and an AccelContainerImage will be created automatically.

- [Deploy using Azure IoT CLI](deploy-to-edge-using-cli.ipynb)

    If your Data Box Edge machine is not in the same subscription as your Azure ML Workspace, you can still deploy your model using the Azure CLI or Portal. You will have to create the AccelContainerImage yourself. The AccelContainerImage is a Docker image stored in the Azure Container Registry associated with your Azure ML Workspace. The AccelContainerImage contains the accelerated model, the runtime to run the accelerated model, and the webservice to allow inferencing.

- [Deploy using Azure Portal](#deploy-using-azure-portal)

    Using the Azure Portal is a quick way to get started and get a sense of the different resources involved. You will need a ContainerImage or AccelContainerImage already created. See the section below.

#### Deploy using Azure Portal
You will need the AccelContainerImage already successfully created in your Azure ML Workspace. The AccelContainerImage is a Docker image stored in the Azure Container Registry associated with your Azure ML Workspace. The AccelContainerImage contains the accelerated model, the runtime to run the accelerated model, and the webservice to allow inferencing.
The steps to deployment are: 
1. Get image location of AccelContainerImage
    * In your Azure ML Workspace, go to the Image section and find the Image you want to deploy. 
    * The type of the image should be Docker and underneath you can find the ``location`` of your image. This is the URL which points to the repository where the Docker image is stored in the Azure Container Registry (ACR) associated with your Workspace. 
2. Get Azure Container Registry credentials
    * In order for IotHub to access your Docker image, it needs access to your Azure Container Registry. 
    * Find your Azure Container Registry resource in the Portal by going to **Overview** section of your Azure ML Workspace. In the section next to your subscription, you should find a link to a ``Registry``. 
    * Then you can find the necessary information ``login server``, ``username``, and ``password`` under **Settings** > **Access Keys**. 
3. Access IoT Hub of the Data Box Edge machine's Compute VM
    * Next, you want to go to the IoT Hub created when you enabled the Data Box Edge's Compute VM. You can find this by going to the Data Box Edge resource in the Azure Portal. 
    * Then **Overview** > **Compute** > **4. Add Modules** > Choose **Advanced** > Click the link **Go to IoT Hub**.
4. Configure deployment of AccelContainerImage module in IoT Hub
    * In the IoT Hub, go to your IoT Edge device which is registered to your Data Box Edge machine.
    * Select **Set modules** near the top of the page.
    * Enter your Azure Container Registry credentials.
    * Choose to add a IoT Custom Module. Then enter name for the module (i.e. resnet50-host) and the Docker image URL.
    * In the **Create Container** options, enter the following JSON. This will give the module access to the FPGA device, FPGA wireserver, and expose the necessary ports.
        ![Example of IoT Hub Portal Create Container options](./iothub_create_container_options.JPG)
        ```
        {
          "HostConfig": {
            "Binds": [
              "/etc/hosts:/etc/hosts"
            ],
            "Privileged": true,
            "Devices": [
              {
                "PathOnHost": "/dev/catapult0",
                "PathInContainer": "/dev/catapult0"
              },
              {
                "PathOnHost": "/dev/catapult1",
                "PathInContainer": "/dev/catapult1"
              }
            ],
            "PortBindings": {
              "50051/tcp": [
                {
                  "HostPort": "50051"
                }
              ]
            }
          }
        }
        ```
    * Save.
5. Configure deployment of sample client module
    * Use Docker to build and push an image with the assets and Python client script.
        ```
        docker login $login_server -u $username -p $password
        docker build -t $login_server.azurecr.io/$client_app -f ./Dockerfile ./$client_app
        docker push $login_server.azurecr.io/$client_app
        ```
    * Create another custom module in the Set Modules section with the URL used above. If using a different ACR or Docker repository, add the required credentials in the same section as before.
    * Enter the following default JSON in the Create Container options. Modify according to the section below.
        ```
        {
          "Tty": true,
          "Cmd": [
            "--input-tensors",
            "Placeholder:0",
            "--output-tensors",
            "classifier/resnet_v1_50/predictions/Softmax:0"
          ]
        }
        ```

### Sample Client
Once your host web service is running on your Data Box Edge machine, you can use one of the sample clients to inference. The sample client iterates through images, sends a gRPC request to the Azure ML host module, prints the response, and also sends the response to IoT Hub as a message. The run.py script that is called on startup of the module takes the following parameters, which can be modified using Cmd argument in IoT Hub's Create Container options. 

```
usage: run.py [-h] [-d IMAGE_DIR] [-i INPUT_TENSORS] [-o OUTPUT_TENSORS]
              [-a ADDRESS] [-p PORT] [-w WAIT] [-s]

optional arguments:
  -h, --help            show this help message and exit
  -d IMAGE_DIR, --image-dir IMAGE_DIR
                        The file path of the image to inference. Default:
                        './assets/'
  -i INPUT_TENSORS, --input-tensors INPUT_TENSORS
                        The name of the input tensor you specified when
                        converting your model. Default for Accelerated resnet50:
                        'Placeholder:0'
  -o OUTPUT_TENSORS, --output-tensors OUTPUT_TENSORS
                        The name of the output tensor you specified when
                        converting your model. Default for Accelerated resnet50:
                        'classifier/resnet_v1_50/predictions/Softmax:0'
  -a ADDRESS, --address ADDRESS
                        The address of the inferencing container. For IOT
                        Edge, this is name of the inferencing host module on
                        the IOT Edge device. Default: azureml-host
  -p PORT, --port PORT  The port of the inferencing container. Default: 50051.
  -w WAIT, --wait WAIT  Time to wait between each inference call. Default: 10.
  -s, --suppress-messages
                        Flag to suppress IOT Hub messages. Default: False. Use
                        --wait flag to lessen or this flag to turn off IOT hub
                        messaging to avoid reaching your limit of IOT Hub
                        messages.
```
#### Example of Create Container Options with parameters
```
{
  "Tty": true,
  "Cmd": [
    "--input-tensors",
    "Placeholder:0",
    "--output-tensors",
    "classifier/resnet_v1_50/predictions/Softmax:0",
    "--wait",
    "0", 
    "-s"
  ]
}
```
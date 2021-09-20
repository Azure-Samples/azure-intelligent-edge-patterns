# OVMS Adaptor



## Prerequisites

1. [Visual Studio Code](https://code.visualstudio.com/) With [Azure IoT Tool Extension](https://marketplace.visualstudio.com/items?itemName=vsciot-vscode.azure-iot-tools)
2. An [Azure Video Analyzer](https://azure.microsoft.com/en-us/products/video-analyzer/) account to get AVA Provision Token
3. An [IoT Hub](https://azure.microsoft.com/en-us/services/iot-hub/) account and an attached IoT edge device with port 8585 opened
4. (Optional) [Iot Explorer](https://docs.microsoft.com/en-us/azure/iot-fundamentals/howto-use-iot-explorer)




## Get Started

1. Open the folder ```factory-ai-vision/OVMSAdaptorEdgeSolution``` by Visual Studio Code
2. Open the file ```deployment.adaptor.amd64```, scroll to the end, and replace ```---AVA_PROVISIONING_TOKEN---``` by yours (from Prerequite 2)
3. Right click on ```deployment.adaptor.amd64```, select ```Create Deployment for Single Device```, and pick your device to deploy (from Prerequisite 3)
4. Login to IoT Hub or your device to check all 6 modules are up and running, including:

	edgeHub
	ovmsserver
	avaedge
	ovmsadaptor
	modulemanager
	edgeAgent

5. Send the Vision On Edge config to model manager, it will download the model if needed, then OpenVino model server will load the models. you could use the helper script to do so

    5.1. ```pip install requests```
    5.2. open ```send_config.py``` and modify the device ip
    5.3. name your VoE Config as voe_config.json (there's already an example in this folder)
    5.4. ```python send_config.py```

6. Register a pipeline topology to Azure Video Analzyer which contains a grpc extension that forward images to ```tcp://ovmsadaptor:5001```, pipelineTopologySet.json is a working example. After setting the topology, you need to set a live pipeline (e.g. ```livePipelineSet.json```) and activate it

7. If everything work successfully, you should be able to see the detected result on the Azure IoT Explorer (from Prerequisite 4)




## VoE Config

VoE Config contains a DAG that each node represent a model or a customized library. The top level schema contains:

```name```: name of your DAG

```nodes```: an array of the nodes

```edges```: an array of the edges



### Nodes

```node_id```: a unique string that represent the node

```name```: the name for the node

```type```: should be one of the following ["source", "openvino_model", "openvino_library", "sink"]

```inputs```: array of input for the node

```outputs```: array of output for the node, same format as inputs

```openvino_model_name```: the name for openvino model, for type ```openvino_model``` only

```openvino_library_name```: the name for openvino library, for type ```openvino_library``` only

```download_uri_openvino```: the uri for the openvino model, will download the model if not yet downloaded before

```params```: parameters for the custom node

```combined```: some custom node (e.g. libcustom_node_model_zoo_intel_object_detection.so) will demux the stream, this is the tag for the sink node to collect the demux results




### Node Inputs/Outputs

```name```: name of the input or output

```metadata```:

&nbsp;&nbsp;&nbsp;&nbsp;```type```: one of ["image", "regression", "classification"]

&nbsp;&nbsp;&nbsp;&nbsp;```shape```: shape of the data, e.g. [1, 3, 416, 416]

&nbsp;&nbsp;&nbsp;&nbsp;```layout```: layout of the data e.g. ["N", "H", "W", "C"]

&nbsp;&nbsp;&nbsp;&nbsp;```color_format```: one of ["RGB", 'BGR"], optinal, for image data only




### Edges

Edges are directed, each edge represent one type of the data come from the source's output to target's input

```source```:

&nbsp;&nbsp;&nbsp;&nbsp;```node_id```: the unique node id in the `nodes`
    
&nbsp;&nbsp;&nbsp;&nbsp;```output_name```: specify the output for the source node where data come from

```target```:

&nbsp;&nbsp;&nbsp;&nbsp;```node_id```: the unique node id in the `nodes`
   
&nbsp;&nbsp;&nbsp;&nbsp;```input_name```: specify the output for the target node where data sent to





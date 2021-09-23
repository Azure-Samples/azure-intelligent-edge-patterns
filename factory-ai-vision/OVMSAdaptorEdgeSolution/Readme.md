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


## How Voe Config works

The structure of Voe Config is a [DAG](https://en.wikipedia.org/wiki/Directed_acyclic_graph).
There're 4 kinds of nodes, ```source```, ```openvino_model```, ```openvino_library```, and ```sink```.
There will be only 1 source node which represent the data (raw image) in the request received by the openvino model server. To process the data we need to forward the data to the next node (can be more than 1) by the edges.


## How Model Manager works

Model manager in charge of c
1. Converting VoE Config to OVMS Config
2. Manage the models for Openvino model server (to enable this model manager need to mount the same volume as Openvino Model server at ```/workspace```)

By default it listens to port 8585, and provide the restful api ```POST HOSTIP:8585 /set_voe_config```. The parameters is a json with following format

    {
        "config": "YOUR_VOE_CONFIG_AS_JSON"
    }
    
You can use following example to send the post request

    import json
    import requests

    j = json.load(open('voe_config.json'))
    js = json.dumps(j)

    requests.post('http://YOUR_DEVICE_IP:8585/set_voe_config', json={'config': js})

Upon the request is received, model manager will

1. Convert the VoE config to OVMS config, and put into ```/workspace/config.json```
2. Download the model or library if the url field for some models aren't empty
3. Model will be downloaded and unziped at /workspace/MODEL_NAME/1/

Since Openvino model server mount the same volume at /workspace, it'll reload the model whenever the ```/workspace/config.json``` is changed


## How the overall AVA-Adaptor-OVMS pipeline works

To enable the integration for AVA and OVMS, we need to use AVA's GRPC extension to forward images to the Adaptor, and then to OVMS.

The images sent from the AVA via GRPC are only the addresses but not the images themselves (to avoid extra memory copy). 

In Adaptor, we use Python's sharedmemory library to implement the functionality to fetch the images via addresses, and then forward to OVMS via GRPC protocol as well. Note that the images sent to OVMS are in tensorflow serving data format, this will be converted in the adaptor internally.

The original prediction result from OVMS is tensorflow serving tensor format as well, in the adaptor it will use the metadata in the VoE config (e.g. shape, color format, ...) to convert it to AVA's format [inference metadata schema](https://docs.microsoft.com/en-us/azure/azure-video-analyzer/video-analyzer-docs/inference-metadata-schema) and then return to the AVA

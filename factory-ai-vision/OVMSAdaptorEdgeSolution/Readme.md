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

7. If everything works successfully, you should be able to see the detected result on the Azure IoT Explorer (from Prerequisite 4)




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


## How VoE Config works

The structure of VoE Config is a [DAG](https://en.wikipedia.org/wiki/Directed_acyclic_graph).
There're 4 kinds of nodes, ```source```, ```openvino_model```, ```openvino_library```, and ```sink```.
There will be only 1 source node which represent the data (raw image) in the request received by the openvino model server. To process the data we need to forward the data to the next node (can be more than 1) by the edges.


### Openvino Face Detection
The following is a simple case that only use the model from openvino model zoo to do the face detection

![arch_img](../assets/Cascade1_ovms%20model_20210927.png?raw=true)


We need 2 nodes to for this case
A source node the represent the image source with some metadata like shape or color format

    {
            "node_id": "0_9",
            "name": "request",
            "type": "source",
            "inputs": [],
            "outputs": [
                {
                    "name": "image",
                    "metadata": {
                        "type": "image",
                        "shape": [
                            1,
                            3,
                            416,
                            416
                        ],
                        "layout": [
                            "N",
                            "H",
                            "W",
                            "C"
                        ],
                        "color_format": "BGR"
                    }
                }
            ],
            "openvino_model_name": "",
            "openvino_library_name": "",
            "download_uri_openvino": "",
            "params": "",
            "combined": ""
    }

A openvino model node to do the face detection

    {
            "node_id": "1_10",
            "name": "face_detection",
            "type": "openvino_model",
            "inputs": [
                {
                    "name": "data",
                    "metadata": {
                        "type": "image",
                        "shape": [
                            1,
                            3,
                            416,
                            416
                        ],
                        "layout": [
                            "N",
                            "H",
                            "W",
                            "C"
                        ],
                        "color_format": "BGR"
                    }
                }
            ],
            "outputs": [
                {
                    "name": "detection_out",
                    "metadata": {
                        "type": "bounding_box",
                        "shape": [
                            1,
                            1,
                            200,
                            7
                        ],
                        "layout": [
                            1,
                            1,
                            "B",
                            "F"
                        ],
                        "labels": [
                            "face"
                        ]
                    }
                }
            ],
            "openvino_model_name": "face-detection-retail-0004",
            "openvino_library_name": "",
            "download_uri_openvino": "",
            "params": "",
            "combined": ""
        }

Note that the `openvino_model_name` need to be the same as the one on openvino intel pretrain model website, for our sample, it's [face-detection-retail-0004](https://docs.openvinotoolkit.org/latest/omz_models_model_face_detection_retail_0004.html)
   
To cascade the result from the image source to the face detection model, we need to add an directed edge to connect them

    {
            "source": {
                "node_id": "0_9",
                "output_name": "image"
            },
            "target": {
                "node_id": "1_10",
                "input_name": "data"
            }
    }
    
Note that each node might more multiple inputs/outputs, for each pair we need to create a edge to connect them
   

### Custom Vision Object Detection Model

![arch_img](../assets/Cascade3_cv%20model_20210927.png?raw=true)

To build the video pipeline with customvision's object detection model, you need to use the type `customvision_model` instead of `openvino_model`


    {   
            "node_id": "1_10",
            "name": "coco_train",
            "type": "customvision_model",
            "inputs": [
                {   
                    "name": "data",
                    "metadata": {
                        "type": "image",
                        "shape": [
                            1,
                            3,
                            416,
                            416
                        ],
                        "layout": [
                            "N",
                            "H",
                            "W",
                            "C"
                        ],
                        "color_format": "BGR"
                    }
                }
            ],
            "outputs": [
                {   
                    "name": "detection_out",
                    "metadata": {
                        "type": "bounding_box",
                        "shape": [
                            1,
                            1,
                            200,
                            7
                        ],
                        "layout": [
                            1,
                            1,
                            "B",
                            "F"
                        ],
                        "labels": [
                            "person"
                        ]
                    }
                }
            ],
            "openvino_model_name": "",
            "openvino_library_name": "",
            "download_uri_openvino": "https://irisscuprodstore.blob.core.windows.net:443/m-dc404180301e4aa3aafee8bdeb198ddc/6eea592ce70f42bebe13a6914391b459.OpenVino.zip?sv=2019-12-12&se=2021-08-27T10%3A20%3A38Z&sr=b&sp=r&sig=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx%3D",
            "params": "",
            "combined": ""
        },

Note that the you need to export the model on customvision with the openvino format, and the paste the link in the ```download_uri_openvino``` field; learn more from [here](../Tutorial/export_cv_model.md)


### Cascase Face Detection Result to Classification Models

To cascade object detection with classification, we need a more complicated graph. We're here using openvino model zoo's face detection, emotion recognition, gender/age recognition as example here.

![arch_img](../assets/Cascade2_%20custom%20node_20210927.png?raw=true)


Since the output for the detection model is the position/confidence of the bounding boxes but not the image for the face, we need to crop the faces and then forward them to classification models. To do so, we add a new `crop` node that need not only the result from the detection model but also the original source image

    {
            "node_id": "3_13",
            "name": "crop",
            "type": "openvino_library",
            "inputs": [
                {
                    "name": "image",
                    "metadata": {
                        "type": "image",
                        "shape": [
                            1,
                            3,
                            416,
                            416
                        ],
                        "layout": [
                            "N",
                            "H",
                            "W",
                            "C"
                        ],
                        "color_format": "BGR"
                    }
                },
                {
                    "name": "detection",
                    "metadata": {
                        "type": "bounding_box",
                        "shape": [
                            1,
                            1,
                            200,
                            7
                        ],
                        "layout": [
                            1,
                            1,
                            "B",
                            "F"
                        ]
                    }
                }
            ],
            "outputs": [
                {
                    "name": "images",
                    "metadata": {
                        "type": "image",
                        "shape": [
                            -1,
                            1,
                            3,
                            64,
                            64
                        ],
                        "layout": [
                            "B",
                            "N",
                            "H",
                            "W",
                            "C"
                        ],
                        "color_format": "BGR"
                    }
                },
                {
                    "name": "coordinates",
                    "metadata": {
                        "type": "bounding_box",
                        "shape": [
                            -1,
                            1,
                            1,
                            200,
                            7
                        ],
                        "layout": [
                            "B",
                            1,
                            1,
                            "B",
                            "F"
                        ]
                    }
                },
                {
                    "name": "confidences",
                    "metadata": {
                        "type": "regression",
                        "shape": [
                            -1,
                            1,
                            1,
                            1,
                            1
                        ],
                        "layout": [
                            "B",
                            1,
                            1,
                            "B",
                            "F"
                        ]
                    }
                }
            ],
            "openvino_model_name": "",
            "openvino_library_name": "libcustom_node_model_zoo_intel_object_detection.so",
            "download_uri_openvino": "",
            "params": {
                "original_image_width": "416",
                "original_image_height": "416",
                "target_image_width": "64",
                "target_image_height": "64",
                "original_image_layout": "NHWC",
                "target_image_layout": "NHWC",
                "convert_to_gray_scale": "false",
                "max_output_batch": "100",
                "confidence_threshold": "0.7",
                "debug": "true",
                "filter_label_id": "-1"
            },
            "combined": ""
        }
	
We've already built-in this custom library ```libcustom_node_model_zoo_intel_object_detection```, for more details about the parameters, please check [here](https://github.com/openvinotoolkit/model_server/tree/main/src/custom_nodes/model_zoo_intel_object_detection)

After adding the ```crop``` node, we now can forward the cropped images to the age/gender classification model node

    {
            "node_id": "7_12",
            "name": "age_gender_recognition",
            "type": "openvino_model",
            "inputs": [
                {
                    "name": "data",
                    "metadata": {
                        "type": "image",
                        "shape": [
                            1,
                            3,
                            64,
                            64
                        ],
                        "layout": [
                            "N",
                            "H",
                            "W",
                            "C"
                        ]
                    }
                }
            ],
            "outputs": [
                {
                    "name": "age_conv3",
                    "metadata": {
                        "type": "regression",
                        "shape": [
                            1,
                            1,
                            1,
                            1
                        ],
                        "layout": [
                            1,
                            1,
                            1,
                            1
                        ],
                        "scale": 100
                    }
                },
                {
                    "name": "prob",
                    "metadata": {
                        "type": "classfication",
                        "shape": [
                            1,
                            2,
                            1,
                            1
                        ],
                        "layout": [
                            1,
                            "P",
                            1,
                            1
                        ],
                        "labels": [
                            "female",
                            "male"
                        ]
                    }
                }
            ],
            "openvino_model_name": "age-gender-recognition-retail-0013",
            "openvino_library_name": "",
            "download_uri_openvino": "",
            "params": "",
            "combined": ""
        },

Similarly we can add emotion recognition model as well

    {
            "node_id": "6_11",
            "name": "emotion_recognition",
            "type": "openvino_model",
            "inputs": [
                {
                    "name": "data",
                    "metadata": {
                        "type": "image",
                        "shape": [
                            1,
                            3,
                            64,
                            64
                        ],
                        "layout": [
                            "N",
                            "H",
                            "W",
                            "C"
                        ]
                    }
                }
            ],
            "outputs": [
                {
                    "name": "prob_emotion",
                    "metadata": {
                        "type": "classification",
                        "shape": [
                            1,
                            5,
                            1,
                            1
                        ],
                        "layout": [
                            1,
                            "C",
                            1,
                            1
                        ],
                        "labels": [
                            "neutral",
                            "happy",
                            "sad",
                            "surprise",
                            "anger"
                        ]
                    }
                }
            ],
            "openvino_model_name": "emotions-recognition-retail-0003",
            "openvino_library_name": "",
            "download_uri_openvino": "",
            "params": "",
            "combined": ""
        }
	
Afterall, we need to use edges to connect all the needed input/output pairs, the full example is [here](voe_config.json)




## How Model Manager works

Model manager in charge of c
1. Converting VoE Config to OVMS Config
2. Manage the models for Openvino model server (to enable this model manager need to mount the same volume as Openvino Model server at ```/workspace```)

By default it listens to port 8585, and provide the restful api ```POST HOSTIP:8585 /set_voe_config```. The parameters is a json with following format

    {
        "config": "YOUR_VOE_CONFIG_AS_JSON"
    }
    
You can use following python script to send the post request

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
Please check this [documentation](https://docs.microsoft.com/en-us/azure/azure-video-analyzer/video-analyzer-docs/analyze-live-video-use-your-model-grpc?pivots=programming-language-csharp) for more details

In Adaptor, we use Python's sharedmemory library to implement the functionality to fetch the images via addresses, and then forward to OVMS via GRPC protocol as well. Note that the images sent to OVMS are in tensorflow serving data format, this will be converted in the adaptor internally.

The original prediction result from OVMS is tensorflow serving tensor format as well, in the adaptor it will use the metadata in the VoE config (e.g. shape, color format, ...) to convert it to AVA's format [inference metadata schema](https://docs.microsoft.com/en-us/azure/azure-video-analyzer/video-analyzer-docs/inference-metadata-schema) and then return to the AVA


![arch_img](../assets/Diagram_20210927.png?raw=true)

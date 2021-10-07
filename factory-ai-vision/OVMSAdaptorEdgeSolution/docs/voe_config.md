# VoE Config

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

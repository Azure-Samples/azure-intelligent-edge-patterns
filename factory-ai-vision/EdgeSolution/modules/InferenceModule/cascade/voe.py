from typing import List, Optional, Dict, Union, Literal, Any
from enum import Enum
from pydantic import BaseModel, constr, validator, conint, Json

#class Node(BaseModel):
#    pass

#class ModelTypeEnum(str, Enum):
#    OBJECT_DETECTION = 'object_detection'
#    CLASSIFICATION = 'classification'
#    OTHER = 'other'

# MetaData

## FIXME plugin metadata
class ImageMetadata(BaseModel):
    name: Literal['image']
    width: int
    height: int
    color_format: Literal['RGB', 'BGR']
    data_type: Literal['FP32', 'FP16', 'INT8']
    layout: List[Union[Literal['N', 'C', 'H', 'W']]]

class BoundingBoxMetadata(BaseModel):
    name: Literal['bounding_box']
    labels: List[str]

class ClassificationMetadata(BaseModel):
    name: Literal['classification']
    layout: List[Literal['N', 'C', 1, 1]]
    labels: List[str]

class RegressionMetadata(BaseModel):
    name: Literal['regression']
    format: List[Union[int, str]]
    scale: float
##

NodeInput = Any
NodeOutput = Any

class _Node(BaseModel):
    node_id: str
    name: str

class NodeInput(BaseModel):
    name: str
    metadata: Any

class NodeOutput(BaseModel):
    name: str
    metadata: Any

class SourceNode(_Node):
    type: Literal['source']
    outputs: List[NodeOutput]

class Source2Node(_Node):
    type: Literal['source2']
    outputs: List[NodeOutput]

class OpenvinoModelNode(_Node):
    type: Literal['openvino_model']
    openvino_model_name: str
    inputs: List[NodeInput]
    outputs: List[NodeOutput]

class OpenvinoLibraryNode(_Node):
    type: Literal['openvino_library']
    openvino_library_name: str
    demultiply_count: Optional[int]
    params: Any
    inputs: List[NodeInput]
    outputs: List[NodeOutput]


class CustomvisionModelNode(_Node):
    type: Literal['customvision_model']
    download_uri_openvino: str
    inputs: List[NodeInput]
    outputs: List[NodeOutput]


class SinkNode(_Node):
    type: Literal['sink']
    combined: Optional[bool]
    inputs: List[NodeInput]

Node = Union[SourceNode, OpenvinoModelNode, OpenvinoLibraryNode, CustomvisionModelNode, SinkNode]



class EdgeSource(BaseModel):
    node_id: str
    output_name: str

class EdgeTarget(BaseModel):
    node_id: str
    input_name: str

class Edge(BaseModel):
    source: EdgeSource
    target: EdgeTarget

class VoeConfig(BaseModel):
    name: str
    nodes: List[Node]
    edges: List[Edge]



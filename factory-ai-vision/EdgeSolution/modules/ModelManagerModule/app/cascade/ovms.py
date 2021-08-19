from typing import List, Optional, Dict, Union, Literal
from enum import Enum
from pydantic import BaseModel, constr, validator, conint

class ImageLayoutEnum(str, Enum):
    NHWC = 'NHWC'
    NCWH = 'NCWH'

class ModelConfig(BaseModel):
    name: str
    base_path: str
    layout: Optional[ImageLayoutEnum]
    shape: Optional[constr(regex=r'\(.*\)')]

class CustomNodeLibraryConfig(BaseModel):
    name: str
    base_path: str

class PipelineNodeTypeEnum(str, Enum):
    DL_MODEL = 'DL model'
    CUSTOM = 'custom'

class PipelineConfigNodeInput(BaseModel):
    node_name: str 
    data_item: str  # both name defined in xml or alias work

class PipelineConfigNodeOutput(BaseModel):
    data_item: str # the name defined in xml
    alias: str

class PipelineConfigModelNode(BaseModel):
    name: str
    model_name: str
    type: Literal['DL model']
    inputs: List[Dict[str, PipelineConfigNodeInput]]
    outputs: List[PipelineConfigNodeOutput]

class PipelineConfigCustomNode(BaseModel):
    name: str
    library_name: str
    type: Literal['custom']
    inputs: List[Dict[str, PipelineConfigNodeInput]]
    outputs: List[PipelineConfigNodeOutput]
    demultiply_count: conint(ge=0) 
    params: Dict

class PipelineConfigOutput(BaseModel):
    node_name: str
    data_item: str

class PipelineConfig(BaseModel):
    name: str
    inputs: List[str]
    #nodes: List[PipelineConfigNode]
    nodes: List[Union[PipelineConfigModelNode,PipelineConfigCustomNode]]
    outputs: List[Dict[str, PipelineConfigOutput]]

class Config(BaseModel):
    model_config_list: List[Dict['config',ModelConfig]]
    custom_node_library_config_list: List[CustomNodeLibraryConfig]
    pipeline_config_list: List[PipelineConfig]

if __name__ == '__main__':
    import json
    j = json.load(open('config.json'))

    c = Config(**j)
    import pprint
    print(c.json(exclude_none=True))
    #pprint.pprint(c.dict(exclude_none=True))
    from IPython import embed; embed()


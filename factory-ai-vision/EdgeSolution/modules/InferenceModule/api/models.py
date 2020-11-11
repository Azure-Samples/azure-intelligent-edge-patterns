"""API models
"""

from enum import Enum
from typing import List, Literal

from pydantic import BaseModel


class PartModel(BaseModel):
    id: str
    name: str


class StreamModel(BaseModel):
    cam_id: str
    cam_type: str
    cam_source: str = None
    send_video_to_cloud: bool
    send_video_to_cloud_parts: List[PartModel]
    send_video_to_cloud_threshold: int


class PartsModel(BaseModel):
    parts: List[PartModel]


class PartDetectionModeEnum(str, Enum):
    part_detection = "PD"
    part_counting = "PC"
    employee_safety = "ES"
    defect_detection = "DD"


class UploadModelBody(BaseModel):
    model_uri: str = None
    model_dir: str = None


class CameraModel(BaseModel):
    id: str
    name: str
    type: str
    source: str
    lines: str
    zones: str
    aoi: str = None
    send_video_to_cloud: bool
    send_video_to_cloud_parts: List[PartModel]
    send_video_to_cloud_threshold: int = 60
    recording_duration: int = 60


class CamerasModel(BaseModel):
    lva_mode: Literal["http", "grpc"]
    fps: float
    cameras: List[CameraModel]

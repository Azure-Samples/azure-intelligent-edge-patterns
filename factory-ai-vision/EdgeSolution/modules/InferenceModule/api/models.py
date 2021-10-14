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
    empty_shelf_alert = "ESA"
    total_customer_counting = "TCC"
    crowded_queue_alert = "CQA"


class UploadModelBody(BaseModel):
    model_uri: str = None
    model_dir: str = None


class UpdateEndpointBody(BaseModel):
    endpoint: str = None
    headers: str = None
    pipeline: str = None


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
    enable_tracking: bool
    counting_start_time: str
    counting_end_time: str


class CamerasModel(BaseModel):
    lva_mode: Literal["http", "grpc"]
    cascade_name: str
    fps: float
    cameras: List[CameraModel]

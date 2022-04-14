import logging
import requests
import json

from django.db import models
from django.db.models.signals import post_save
from ..azure_iot.utils import model_manager_module_url
from ..azure_app_insight.utils import get_app_insight_logger

logger = logging.getLogger(__name__)

# Create your models here.
class Cascade(models.Model):
    name = models.CharField(max_length=200, null=True, blank=True, default="")
    flow = models.CharField(max_length=1000000, null=True, blank=True, default="")
    raw_data = models.CharField(max_length=1000000, null=True, blank=True, default="")
    prediction_uri = models.CharField(
        max_length=1000, null=True, blank=True, default=""
    )

    screenshot = models.CharField(max_length=1000000, null=True, blank=True, default="")

    def __repr__(self):
        return self.name.__repr__()

    def __str__(self):
        return self.name.__str__()

    def get_prediction_uri(self):
        """get_prediction_uri"""
        return self.prediction_uri

    # automatically modify single model cascade 
    @staticmethod
    def post_create(**kwargs):
        instance = kwargs["instance"]
        # logger.warning("cascade post save: send config to model manager")
        # url = "http://" + str(model_manager_module_url()) + "/set_voe_config"
        # data = {"config": instance.flow}
        # res = requests.post(url, json=data)
        # logger.warning(res.text)

        logger.warning("cascade post save: automatically modify single model cascade ")
        # example simple model cascade
        example_flow = json.loads("{\"name\":\"Default Cascade 333\",\"nodes\":[{\"node_id\":\"0_9\",\"name\":\"request\",\"type\":\"source\",\"inputs\":[],\"outputs\":[{\"name\":\"image\",\"metadata\":{\"type\":\"image\",\"shape\":[1,3,416,416],\"layout\":[\"N\",\"H\",\"W\",\"C\"],\"color_format\":\"BGR\"}}],\"openvino_model_name\":\"\",\"openvino_library_name\":\"\",\"download_uri_openvino\":\"\",\"params\":\"\",\"combined\":\"\"},{\"node_id\":\"1_13\",\"name\":\"0927-od\",\"type\":\"customvision_model\",\"inputs\":[{\"name\":\"data\",\"metadata\":{\"type\":\"image\",\"shape\":[1,3,416,416],\"layout\":[\"N\",\"H\",\"W\",\"C\"],\"color_format\":\"BGR\"}}],\"outputs\":[{\"name\":\"detection_out\",\"metadata\":{\"type\":\"bounding_box\",\"shape\":[1,1,200,7],\"layout\":[1,1,\"B\",\"F\"],\"labels\":[\"a\",\"b\"]}}],\"openvino_model_name\":\"\",\"openvino_library_name\":\"\",\"download_uri_openvino\":\"https://irisscuprodstore.blob.core.windows.net:443/m-9321a0d43ed44b4eb96c17630044ebe9/0be00e6ba05041c28bd875415baa849d.OpenVino.zip?sv=2019-12-12&se=2021-12-08T09%3A06%3A23Z&sr=b&sp=r&sig=aenQG5mGoumUmPNT7AJUKZxQEVfN9R8NewH%2FqumwWlk%3D\",\"params\":\"\",\"combined\":\"\"},{\"node_id\":\"2_10\",\"name\":\"Crop & Filter\",\"type\":\"openvino_library\",\"inputs\":[{\"name\":\"image\",\"metadata\":{\"type\":\"image\",\"shape\":[1,3,416,416],\"layout\":[\"N\",\"H\",\"W\",\"C\"],\"color_format\":\"BGR\"}},{\"name\":\"detection\",\"metadata\":{\"type\":\"bounding_box\",\"shape\":[1,1,200,7],\"layout\":[1,1,\"B\",\"F\"]}}],\"outputs\":[{\"name\":\"images\",\"metadata\":{\"type\":\"image\",\"shape\":[-1,1,3,64,64],\"layout\":[\"B\",\"N\",\"H\",\"W\",\"C\"],\"color_format\":\"BGR\"}},{\"name\":\"coordinates\",\"metadata\":{\"type\":\"bounding_box\",\"shape\":[-1,1,1,200,7],\"layout\":[\"B\",1,1,\"B\",\"F\"]}},{\"name\":\"confidences\",\"metadata\":{\"type\":\"regression\",\"shape\":[-1,1,1,1,1],\"layout\":[\"B\",1,1,\"B\",\"F\"]}},{\"name\":\"label_ids\",\"metadata\":{\"type\":\"classification\",\"shape\":[-1,1,1,1,1],\"layout\":[\"B\",1,1,\"B\",\"F\"]}}],\"openvino_model_name\":\"\",\"openvino_library_name\":\"libcustom_node_model_zoo_intel_object_detection.so\",\"download_uri_openvino\":\"\",\"params\":{\"original_image_width\":\"416\",\"original_image_height\":\"416\",\"target_image_width\":\"64\",\"target_image_height\":\"64\",\"original_image_layout\":\"NHWC\",\"target_image_layout\":\"NHWC\",\"convert_to_gray_scale\":\"false\",\"max_output_batch\":\"100\",\"confidence_threshold\":\"0.4\",\"debug\":\"true\",\"filter_label_id\":\"-1\"},\"combined\":\"\"}],\"edges\":[{\"source\":{\"node_id\":\"0_9\",\"output_name\":\"image\"},\"target\":{\"node_id\":\"1_13\",\"input_name\":\"data\"}},{\"source\":{\"node_id\":\"1_13\",\"output_name\":\"detection_out\"},\"target\":{\"node_id\":\"2_10\",\"input_name\":\"detection\"}},{\"source\":{\"node_id\":\"0_9\",\"output_name\":\"image\"},\"target\":{\"node_id\":\"2_10\",\"input_name\":\"image\"}}]}")

        flow = json.loads(instance.flow)

        node_types = []
        model_index = -1
        for (idx, node) in enumerate(flow["nodes"]):
            node_types.append(node["type"])
            if node["type"] in ["openvino_model", "customvision_model"]:
                model_index = idx

        len_check = len(flow["nodes"]) == 3 and len(flow["edges"]) == 2
        type_check = "sink" in node_types and "source" in node_types

        if len_check and type_check and model_index != -1:
            temp_node_id = example_flow["nodes"][1]["node_id"]
            example_flow["name"] = flow["name"]
            example_flow["nodes"][1] = flow["nodes"][model_index]
            example_flow["nodes"][1]["node_id"] = temp_node_id
            instance.flow = json.dumps(example_flow)
            logger.warning("cascade modified.")
            instance.save()
        else:
            pass

        # sending info to app-insight
        az_logger = get_app_insight_logger()
        properties = {
            "custom_dimensions": {
                "create_cascade": json.dumps({
                    "name": instance.name,
                })
            }
        }
        az_logger.warning(
            "create_cascade",
            extra=properties,
        )



post_save.connect(Cascade.post_create, Cascade, dispatch_uid="Cascade_post")


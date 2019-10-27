# Copyright (c) Microsoft. All rights reserved.
# Licensed under the MIT license. See LICENSE file in the project root for
# full license information.

from client import PredictionClient
import numpy as np
import ssdvgg_utils
import traceback


# Tensor outputs for FPGA retail model
tensor_outputs = [
    'ssd_300_vgg/block4_box/Reshape_1:0',
    'ssd_300_vgg/block7_box/Reshape_1:0',
    'ssd_300_vgg/block8_box/Reshape_1:0',
    'ssd_300_vgg/block9_box/Reshape_1:0',
    'ssd_300_vgg/block10_box/Reshape_1:0',
    'ssd_300_vgg/block11_box/Reshape_1:0',
    'ssd_300_vgg/block4_box/Reshape:0',
    'ssd_300_vgg/block7_box/Reshape:0',
    'ssd_300_vgg/block8_box/Reshape:0',
    'ssd_300_vgg/block9_box/Reshape:0',
    'ssd_300_vgg/block10_box/Reshape:0',
    'ssd_300_vgg/block11_box/Reshape:0'
]

client = PredictionClient("grocerymodelfpga", 50051)

class FPGAImageProcessor:
    def __init__(self):
        self.processor_type = "FPGA"

    def process_image(self, image_body):
        try:
            img = image_body.smallImageRGB
            img = np.asarray(img, dtype=np.float32)
            img = np.expand_dims(img, axis=0)
            print("Scoring image")
            result = client.score_numpy_arrays({'brainwave_ssd_vgg_1_Version_0.1_input_1:0':img},
                                                outputs=tensor_outputs)
            print("Post-processing scores")
            classes, scores, bboxes = ssdvgg_utils.postprocess(result, select_threshold=0.5)
            processed_results = {}
            processed_results["classes"] = classes.tolist()
            processed_results["scores"] = scores.tolist()
            processed_results["bboxes"] = bboxes.tolist()
            return processed_results
        except Exception as ex:
            print("Unexpected error:", ex)
            traceback.print_exc()
            return None

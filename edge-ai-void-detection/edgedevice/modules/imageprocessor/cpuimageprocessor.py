# Copyright (c) Microsoft. All rights reserved.
# Licensed under the MIT license. See LICENSE file in the project root for
# full license information.

import json
import requests
import traceback

def make_image_json(image_bytes):
    """Create a JSON string containing the representation of the image to be
    sent to the CPU model.
    """
    try:
        height = 300
        width = 300
        image_index = 0
        json = '{"img": ['
        for i in range(0, height):
            json += '['
            for j in range(0, width):
                R = image_bytes[image_index]
                image_index += 1
                G = image_bytes[image_index]
                image_index += 1
                B = image_bytes[image_index]
                image_index += 1
                json += "[{},{},{}]".format(R, G, B)
                if j < width - 1:
                    json += ','
            json += ']'
            if i < height - 1:
                json += ','
        json += "]}"
        return json
    except Exception as ex:
        print("Error converting small image to JSON")
        print(ex)
        return None

class CPUImageProcessor:
    """An image processor for use with the CPU model."""
    def __init__(self):
        self.processor_type = "CPU"

    def process_image(self, image_body):
        url = "http://grocerymodel:5001/score"
        try:
            image = image_body.smallImageRGB
            json_image = make_image_json(image)
            headers = {"Content-Type": "application/json"}
            response = requests.post(url, json_image, headers=headers)
            result = json.loads(response.text)
            return result
        except Exception as ex:
            print("Unexpected error:", ex)
            traceback.print_exc()
            return None


# Copyright (c) Microsoft. All rights reserved.
# Licensed under the MIT license. See LICENSE file in the project root for
# full license information.

import cv2
import numpy as np

def draw_boxes_on_img(img_rgb, classes, scores, bboxes, thickness=2):
    """Converts the small image from an RGB bytes object to a jpeg image and
    draws the bounding boxes onto it.
    Returns the resulting jpeg image.
    """
    # Convert the RGB array to a cv2 image.
    shape = (300, 300, 3)
    img = np.frombuffer(img_rgb, dtype = np.dtype('uint8'))
    img = np.reshape(img, shape)
    img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)

    # Draw the bounding boxes.
    color = (26, 26, 224)
    for i in range(len(bboxes)):
        bbox = bboxes[i]
        # Draw bounding box
        p1 = (int(bbox[0] * shape[0]), int(bbox[1] * shape[1]))
        p2 = (int(bbox[2] * shape[0]), int(bbox[3] * shape[1]))
        cv2.rectangle(img, p1[::-1], p2[::-1], color, thickness)
        # Draw text
        s = "outofstock"
        p1 = (p1[0] - 5, p1[1])
        cv2.putText(img, s, p1[::-1], cv2.FONT_HERSHEY_DUPLEX, 0.4, color, 1)

    # Convert the cv2 image to a jpeg.
    jpeg = cv2.imencode(".jpg", img, [cv2.IMWRITE_JPEG_QUALITY, 75])
    return jpeg[1]

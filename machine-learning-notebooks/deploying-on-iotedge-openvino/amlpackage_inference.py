# Copyright (c) Microsoft. All rights reserved.
# Licensed under the MIT license. See LICENSE file in the project root for
# full license information.

import cv2
import numpy as np
import time
import datetime
import json

threshold = 0.35
colors = [(255,0,0),(0,255,0),(0,0,255),(128,0,0),(0,128,0),
          (0,0,128),(255,255,0),(0,255,255),(255,0,255),(128,128,0),
          (0,128,128),(128,0,128),(255,128,128),(128,255,128),(128,128,255),
          (128,64,64),(64,128,64),(64,64,128),(255,64,64),(64,255,64)]
anchors = [1.08, 1.19, 3.42, 4.41, 6.63, 11.38, 9.42, 5.11, 16.62, 10.52]

def run_onnx(msg, sess, image, labels, display_flag):
    """
    Detect objects in frame of your camera, and returns results.
    Uses TinyYolo from the onnxmodel zoo. Feel free to use your own model or choose another from https://github.com/onnx/models.
    """
    input_name = sess.get_inputs()[0].name

    def softmax(x):
        return np.exp(x) / np.sum(np.exp(x), axis=0)

    def sigmoid(x):
        return 1/(1+np.exp(-x))

    start_time = time.time()
    pred = sess.run(None, {input_name: msg})
    duration = time.time() - start_time  # sec
    pred = np.array(pred[0][0])

    output = []

    # Goes through each of the 'cells' in tiny_yolo. Each cell is responsible for detecting 5 objects
    for by in range (0, 13):
        for bx in range (0, 13):
            # Iterate through each 'object'
            for bound in range (0, 5):
                # extract x, y, width, height, and confidence
                channel = bound*25
                tx = pred[channel][by][bx]
                ty = pred[channel+1][by][bx]
                tw = pred[channel+2][by][bx]
                th = pred[channel+3][by][bx]
                tc = pred[channel+4][by][bx]

                # apply sigmoid function to get real x/y coordinates, shift by cell position
                x = (float(bx) + sigmoid(tx))*32
                y = (float(by) + sigmoid(ty))*32
                
                #Apply sigmoid to get confidence on a scale from 0 to 1
                confidence = sigmoid(tc)

                #Iterate through 20 classes and apply softmax to see which one has the highest confidence, which would be the class of the object
                class_out = []
                for i in range(20):
                    class_out.append(pred[channel+5+i][by][bx])
                class_out = softmax(np.array(class_out))
                class_detected = np.argmax(class_out)
                display_confidence = class_out[class_detected]*confidence

                #Save if class confidence*object confidence > threshold
                if display_confidence > threshold:
                    w = np.exp(tw) * 32 * anchors[2*bound  ]
                    h = np.exp(th) * 32 * anchors[2*bound+1]
                    x = x - w/2  # left on the resized image
                    y = y - h/2  # top on the resized image

                    # draw BBOX on the original image
                    image_h, image_w = image.shape[:2]
                    is_based_w = 416.0 >= (image_h * 416.0 / float(image_w))
                    if  is_based_w:
                        scale = float(image_w) / 416.0
                        offset = (416.0 - image_h * 416.0 / float(image_w)) / 2
                        y -= offset
                    else:
                        scale = float(image_h) / 416.0
                        offset = (416.0 - image_w * 416.0 / float(image_h)) / 2
                        x -= offset
                
                    x1 = max(int(np.round(x * scale)), 0)
                    y1 = max(int(np.round(y * scale)), 0)
                    x2 = min(int(np.round((x + w) * scale)), image_w)
                    y2 = min(int(np.round((y + h) * scale)), image_h)

                    # Draw labels and bbox and output message
                    label = labels[class_detected]
                    color = colors[class_detected]

                    if display_flag is "ON":
                        cv2.rectangle(image, (x1, y1), (x2, y2), color, 2)
                        cv2.rectangle(image, (x1, y1 - 30), (x1 + 120, y1), color, -1)
                        cv2.putText(image, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255 - color[0], 255 - color[1], 255 - color[2]), 1, cv2.LINE_AA)

                    message = { "Label": label,
                                "Confidence": "{:6.4f}".format(display_confidence),
                                "Position": [int(x1), int(y1), int(x2), int(y2)],
                                "TimeStamp": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
                              }
                    output.append(message)

    print('Results: {}' .format(json.dumps(output)))

    # Output to local display
    if display_flag is "ON":
        fps = 1.0 / duration
        duration *= 1000.0
        text = "Detect 1 frame : {:8.3f} ms | {:6.2f} fps" .format(duration, fps)
        cv2.putText(image, text, (30, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 1, cv2.LINE_AA)

        cv2.imshow("Detection Result", image)
        cv2.waitKey(1)
            
    return output
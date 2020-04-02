"""
 Copyright (c) 2019 Intel Corporation

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.

"""
import numpy as np
import math
import cv2
import onnxruntime
import time

class ObjectDetection(object):
    """Class for Custom Vision's exported object detection model
    """

    def __init__(self, data, labels=None, prob_threshold=0.10, max_detections = 20):
        """Initialize the class

        Args:
            labels ([str]): list of labels for the exported model.
            prob_threshold (float): threshold for class probability.
            max_detections (int): the max number of output results.
        """

        print("Call: Constructor: ObjectDetection.__init__")

        self.labels = labels
        self.prob_threshold = prob_threshold
        self.max_detections = max_detections


        if "IouThreshold" in data:
            self.iou_threshold = data["IouThreshold"]
        else:
            self.iou_threshold = 0.45
        if "ConfThreshold" in data:
            self.conf_threshold = data["ConfThreshold"]
        else:
            self.conf_threshold = 0.5

        # TBD Need to add error check
        self.platform = str(data["Platform"])
        self.model_filename = str(data["ModelFileName"])

        if "LabelFileName" in data:
            self.label_filename = str(data["LabelFileName"])
        else:
            self.label_filename = str("labels.txt")

        if "InputStream" in data:
            self.video_inp = str(data["InputStream"])

        # Look for input width and height from cvexport.manifest
        # if not present, read from model.onnx file (ref: onnxruntime_session_init)
        if "ScaleWidth" in data:
            self.model_inp_width = int(data["ScaleWidth"])
        if "ScaleHeight" in data:
            self.model_inp_height = int(data["ScaleHeight"])

        if "RenderFlag" in data:
            self.render = int(data["RenderFlag"])
        else:
            self.render = 1

        if "Anchors" in data:
            self.anchors = np.array(data["Anchors"])
        else:
            self.anchors = np.array([[1.08, 1.19], [3.42, 4.41],  [6.63, 11.38],  [9.42, 5.11],  [16.62, 10.52]])

        if "InputFormat" in data:
            self.input_format = str(data["InputFormat"])
        else:
            self.input_format = "RGB"

        self.session = None
        self.onnxruntime_session_init()

    def onnxruntime_session_init(self):

        with open(str("./model/" + self.label_filename), 'r') as f:
             labels = [l.strip() for l in f.readlines()]

        assert len(labels) >= 1, "At least 1 label is required"
        self.labels = labels

        #super(ObjectDetection, self).__init__(labels)
        print("\n Triggering Inference...")

        self.session = onnxruntime.InferenceSession(str("./model/" + self.model_filename))

        # Reading input width & height from onnx model file
        self.model_inp_width = self.session.get_inputs()[0].shape[2]
        self.model_inp_height = self.session.get_inputs()[0].shape[3]

        print("\n Started Inference...")
        self.input_name = self.session.get_inputs()[0].name
        if self.render == 0:
           print("Press Ctl+C to exit...")

    def _logistic(self, x):
        return np.where(x > 0, 1 / (1 + np.exp(-x)), np.exp(x) / (1 + np.exp(x)))

    def _non_maximum_suppression(self, boxes, class_probs, max_detections):
        """Remove overlapping bouding boxes
        """
        assert len(boxes) == len(class_probs)

        max_detections = min(max_detections, len(boxes))
        max_probs = np.amax(class_probs, axis=1)
        max_classes = np.argmax(class_probs, axis=1)

        areas = boxes[:, 2] * boxes[:, 3]

        selected_boxes = []
        selected_classes = []
        selected_probs = []

        while len(selected_boxes) < max_detections:
            # Select the prediction with the highest probability.
            i = np.argmax(max_probs)
            if max_probs[i] < self.prob_threshold:
                break

            # Save the selected prediction
            selected_boxes.append(boxes[i])
            selected_classes.append(max_classes[i])
            selected_probs.append(max_probs[i])

            box = boxes[i]
            other_indices = np.concatenate((np.arange(i), np.arange(i + 1, len(boxes))))
            other_boxes = boxes[other_indices]

            # Get overlap between the 'box' and 'other_boxes'
            x1 = np.maximum(box[0], other_boxes[:, 0])
            y1 = np.maximum(box[1], other_boxes[:, 1])
            x2 = np.minimum(box[0] + box[2], other_boxes[:, 0] + other_boxes[:, 2])
            y2 = np.minimum(box[1] + box[3], other_boxes[:, 1] + other_boxes[:, 3])
            w = np.maximum(0, x2 - x1)
            h = np.maximum(0, y2 - y1)

            # Calculate Intersection Over Union (IOU)
            overlap_area = w * h
            iou = overlap_area / (areas[i] + areas[other_indices] - overlap_area)

            # Find the overlapping predictions
            overlapping_indices = other_indices[np.where(iou > self.iou_threshold)[0]]
            overlapping_indices = np.append(overlapping_indices, i)

            # Set the probability of overlapping predictions to zero, and udpate max_probs and max_classes.
            class_probs[overlapping_indices, max_classes[i]] = 0
            max_probs[overlapping_indices] = np.amax(class_probs[overlapping_indices], axis=1)
            max_classes[overlapping_indices] = np.argmax(class_probs[overlapping_indices], axis=1)

        assert len(selected_boxes) == len(selected_classes) and len(selected_boxes) == len(selected_probs)
        return selected_boxes, selected_classes, selected_probs

    def _extract_bb(self, prediction_output, anchors):
        assert len(prediction_output.shape) == 3
        num_anchor = anchors.shape[0]
        height, width, channels = prediction_output.shape
        assert channels % num_anchor == 0

        num_class = int(channels / num_anchor) - 5
        assert num_class == len(self.labels)

        outputs = prediction_output.reshape((height, width, num_anchor, -1))

        # Extract bouding box information
        x = (self._logistic(outputs[..., 0]) + np.arange(width)[np.newaxis, :, np.newaxis]) / width
        y = (self._logistic(outputs[..., 1]) + np.arange(height)[:, np.newaxis, np.newaxis]) / height
        w = np.exp(outputs[..., 2]) * anchors[:, 0][np.newaxis, np.newaxis, :] / width
        h = np.exp(outputs[..., 3]) * anchors[:, 1][np.newaxis, np.newaxis, :] / height

        # (x,y) in the network outputs is the center of the bounding box. Convert them to top-left.
        x = x - w / 2
        y = y - h / 2
        boxes = np.stack((x, y, w, h), axis=-1).reshape(-1, 4)

        # Get confidence for the bounding boxes.
        objectness = self._logistic(outputs[..., 4])

        # Get class probabilities for the bounding boxes.
        class_probs = outputs[..., 5:]
        class_probs = np.exp(class_probs - np.amax(class_probs, axis=3)[..., np.newaxis])
        class_probs = class_probs / np.sum(class_probs, axis=3)[..., np.newaxis] * objectness[..., np.newaxis]
        class_probs = class_probs.reshape(-1, num_class)

        assert len(boxes) == len(class_probs)
        return (boxes, class_probs)

    def predict_image(self, image):
        inputs = self.preprocess(image)
        prediction_outputs, infer_time = self.predict(inputs)
        return self.postprocess(prediction_outputs), infer_time

    def preprocess(self, image):
        if self.input_format == "RGB":
           image = cv2.resize(image, (int(self.model_inp_width), int(self.model_inp_height)))
        elif self.input_format == "BGR":
           image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
           image = cv2.resize(image, (int(self.model_inp_width), int(self.model_inp_height)))
        elif self.input_format == "GRAY":
           image = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)
           image = cv2.resize(image, (int(self.model_inp_width), int(self.model_inp_height)))
        return image

    def predict(self, preprocessed_inputs):
        """Evaluate the model and get the output

        Need to be implemented for each platforms. i.e. TensorFlow, CoreML, etc.
        """
        inputs = np.array(preprocessed_inputs, dtype=np.float32)[np.newaxis,:,:,(2,1,0)] # RGB -> BGR
        inputs = np.ascontiguousarray(np.rollaxis(inputs, 3, 1))
        start = time.time()
        outputs = self.session.run(None, {self.input_name: inputs})
        end = time.time()
        inference_time = end - start
        return np.squeeze(outputs).transpose((1,2,0)), inference_time

    def postprocess(self, prediction_outputs):
        """ Extract bounding boxes from the model outputs.

        Args:
            prediction_outputs: Output from the object detection model. (H x W x C)

        Returns:
            List of Prediction objects.
        """
        boxes, class_probs = self._extract_bb(prediction_outputs, self.anchors)

        # Remove bounding boxes whose confidence is lower than the threshold.
        max_probs = np.amax(class_probs, axis=1)
        index, = np.where(max_probs > self.prob_threshold)
        index = index[(-max_probs[index]).argsort()]

        # Remove overlapping bounding boxes
        selected_boxes, selected_classes, selected_probs = self._non_maximum_suppression(boxes[index],
                                                                                         class_probs[index],
                                                                                         self.max_detections)

        return [{'probability': round(float(selected_probs[i]), 8),
                 'tagId': int(selected_classes[i]),
                 'tagName': self.labels[selected_classes[i]],
                 'boundingBox': {
                     'left': round(float(selected_boxes[i][0]), 8),
                     'top': round(float(selected_boxes[i][1]), 8),
                     'width': round(float(selected_boxes[i][2]), 8),
                     'height': round(float(selected_boxes[i][3]), 8)
                 }
                 } for i in range(len(selected_boxes))]


import os
import numpy as np
import cv2
import onnxruntime as onnxrt

class DetectorBase:

    @staticmethod
    def path_exists(file_path):
        if not os.path.exists(file_path):
            raise FileNotFoundError(file_path)

        return file_path

    def __init__(self, model_path, confidence_thresh):

        self.model_path = self.path_exists(model_path)
        self.confidence_thresh = confidence_thresh
        self.net = None
        self.width = None
        self.height = None

    def detect(self, img):
        pass

    def get_width_height(self,frame):
        if self.width is None:
            self.height, self.width = frame.shape[:2]

        return self.width, self.height

class DetectorCV(DetectorBase):
    
    '''
    People Detectors using OpenCV
    '''

    CLASSES = ["background", "aeroplane", "bicycle", "bird", "boat",
        "bottle", "bus", "car", "cat", "chair", "cow", "diningtable",
        "dog", "horse", "motorbike", "person", "pottedplant", "sheep",
        "sofa", "train", "tvmonitor"]

    def __init__(self, model_path, pbtxt_path, confidence_thresh = 0.4):
        '''
        Arguments:
            model_path - path to the Caffe model file
            pbtxt_path - path to the protoxt files required by Caffe
        '''
        super().__init__(model_path, confidence_thresh)
        
        pbtxt_path = self.path_exists(pbtxt_path)
        self.net = cv2.dnn.readNetFromCaffe(pbtxt_path, self.model_path)

    def detect(self, frame):
        (W, H) = self.get_width_height(frame)

        # convert the frame to a blob and pass the blob through the
        # network and obtain the detections
        blob = cv2.dnn.blobFromImage(frame, 0.007843, (W, H), 127.5)
        self.net.setInput(blob)
        detections = self.net.forward()

        detected_people = []
        # loop over the detections
        for i in np.arange(0, detections.shape[2]):
            # extract the confidence (i.e., probability) associated
            # with the prediction
            confidence = detections[0, 0, i, 2]

            # filter out weak detections by requiring a minimum
            # confidence
            if confidence > self.confidence_thresh:
                # extract the index of the class label from the
                # detections list
                idx = int(detections[0, 0, i, 1])

                # if the class label is not a person, ignore it
                if self.CLASSES[idx] != "person":
                    continue

                # compute the (x, y)-coordinates of the bounding box
                # for the object
                box = detections[0, 0, i, 3:7] * np.array([W, H, W, H])
                (startX, startY, endX, endY) = box.astype("int")

                detected_people.append((startX, startY, endX, endY))
        return detected_people

class DetectorOnnx(DetectorBase):

    def __init__(self, model_file, confidence_thresh=0.4):
        super().__init__(model_file, confidence_thresh)
        self.sess = onnxrt.InferenceSession(self.model_path)

    def preprocess(self, frame):
        '''
        Resizing to 1200x1200 should have been done prior to calling
        '''
        img = cv2.resize(frame, (1200, 1200), interpolation=cv2.INTER_LINEAR)

        img_data = img / 255.
        img_data = np.transpose(img_data, [2, 0, 1])

        mean_vec = np.array([0.485, 0.456, 0.406])[..., np.newaxis, np.newaxis]
        stddev_vec = np.array([0.229, 0.224, 0.225])[..., np.newaxis, np.newaxis]

        img_data = (img_data - mean_vec) / stddev_vec
        # (1, 3, 1200, 1200) NCWH image
        norm_img_data = np.expand_dims(img_data, 0)

        return norm_img_data.astype('float32')

    def detect(self, frame):
        (W, H) = self.get_width_height(frame)

        img = self.preprocess(frame)

        bboxes, labels, scores = self.sess.run(["bboxes", "labels", "scores"], {"image": img})
        
        bboxes = np.squeeze(bboxes, 0)
        labels = np.squeeze(labels, 0)
        scores = np.squeeze(scores, 0)

        # people we have detected
        idxs_people = set(np.nonzero(labels == 1)[0])
        if len(idxs_people) == 0:
            return []

        idxs_scores = set(np.nonzero(scores >= self.confidence_thresh)[0])
        idxs_scores = idxs_people.intersection(idxs_scores)            
        if len(idxs_scores) == 0:
            return []

        mult_array = np.array([W, H, W, H])[np.newaxis, ...]
        bboxes = (bboxes[list(idxs_scores), :] * mult_array).astype('int')

        return bboxes
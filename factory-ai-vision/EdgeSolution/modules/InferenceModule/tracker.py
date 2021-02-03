from collections import namedtuple
import numpy as np
import cv2
from shapely.geometry import Polygon
from sort import *

#_m = (170 - 1487) / (680 - 815)
#_b = 680/2 - _m * 170/2
# def compute_direction(_m, _b, x, y):
#    return _m * x + _b - y
# def is_same_direction(x1, y1, x2, y2):
#    return 0.000000001 < (compute_direction(x1, y1) * compute_direction(x2, y2))


class Tracker():
    def __init__(self, max_age=1, min_hits=3, iou_threshold=0.3):
        self.tracker = Sort(
            max_age=max_age, min_hits=min_hits, iou_threshold=0.3)
        self.objs = []

    def update(self, detections):
        #_detections = list([d.x1, d.x2, d.y1, d.y2, d.score] for d in detections)
        if len(detections) > 0:
            self.objs = self.tracker.update(np.array(detections))
        else:
            self.objs = self.tracker.update(np.empty((0, 5)))

    def get_objs(self):
        return self.objs


class Line():
    def __init__(self, x1, y1, x2, y2):
        self.id = None
        self.x1 = x1
        self.y1 = y1
        self.x2 = x2
        self.y2 = y2
        if x1 == x2:
            self.is_vertical = True
            self.x = x1
        else:
            self.is_vertical = False
            self.m = (y1-y2) / (x1-x2)
            self.b = y1 - self.m * x1

    def __str__(self):
        return 'Line: (%d,%d) -> (%d,%d), m: %s, b: %s' % (self.x1, self.y1, self.x2, self.y2, self.m, self.b)

    def compute_side(self, x, y):
        if self.is_vertical:
            return self.x - x
        else:
            return self.m * x + self.b - y

    def is_same_side(self, x1, y1, x2, y2):
        return 0.000000001 < (self.compute_side(x1, y1) * self.compute_side(x2, y2))


def bb_intersection_over_union(boxA, boxB):
    # determine the (x, y)-coordinates of the intersection rectangle
    xA = max(boxA[0], boxB[0])
    yA = max(boxA[1], boxB[1])
    xB = min(boxA[2], boxB[2])
    yB = min(boxA[3], boxB[3])
    # compute the area of intersection rectangle
    interArea = max(0, xB - xA + 1) * max(0, yB - yA + 1)
    # compute the area of both the prediction and ground-truth
    # rectangles
    boxAArea = (boxA[2] - boxA[0] + 1) * (boxA[3] - boxA[1] + 1)
    boxBArea = (boxB[2] - boxB[0] + 1) * (boxB[3] - boxB[1] + 1)
    # compute the intersection over union by taking the intersection
    # area and dividing it by the sum of prediction + ground-truth
    # areas - the interesection area
    iou = interArea / float(boxAArea + boxBArea - interArea)
    # return the intersection over union value
    return iou


class Rect():
    def __init__(self, x1, y1, x2, y2):
        self.id = None
        self.x1 = x1
        self.y1 = y1
        self.x2 = x2
        self.y2 = y2

    def is_inside(self, x1, y1, x2, y2):
        box1 = [self.x1, self.y1, self.x2, self.y2]
        box2 = [x1, y1, x2, y2]
        if bb_intersection_over_union(box1, box2) > 0.000001:
            return True
        else:
            return False


class Polygon_obj():
    def __init__(self, obj):
        self.id = None
        self.polygon = Polygon(obj)

    def is_inside(self, x1, y1, x2, y2):
        obj_shape = Polygon([[x1, y1], [x2, y1], [x2, y2], [x1, y2]])
        if self.polygon.is_valid and self.polygon.intersects(obj_shape):
            return True
        else:
            return False


def draw_counter(img, counter):
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 0.7
    thickness = 2
    img = cv2.putText(img, 'Objects: '+str(counter),
                      (img.shape[1]-150, 30), font, font_scale, (0, 255, 255), thickness)
    return img


class _Tracker():

    def __init__(self):
        self.tracker = Sort()
        self.detected = {}
        self.counter = 0
        self.line_x1 = None
        self.line_y1 = None
        self.line_x2 = None
        self.line_y2 = None
        self._m = 0
        self._b = 0

    def set_line(self, line_x1, line_y1, line_x2, line_y2):
        #self._m = (170 - 1487) / (680 - 815)
        #self._b = 680/2 - _m * 170/2
        self.line_x1 = line_x1
        self.line_y1 = line_y1
        self.line_x2 = line_x2
        self.line_y2 = line_y2
        if line_y1 == line_y2:
            self._m = 99999999
            self._b = line_y1
        else:
            self._m = (line_x1 - line_y1) / (line_x2 - line_y2)
            self._b = line_y1 - self._m * line_x1

    def compute_direction(self, x, y):
        return self._m * x + self._b - y

    def is_same_direction(self, x1, y1, x2, y2):
        return 0.000000001 < (self.compute_direction(x1, y1) * self.compute_direction(x2, y2))

    def draw_line(self, img):
        if self.line_x1:
            img = cv2.line(img, (int(self.line_x1), int(self.line_y1)), (int(
                self.line_x2), int(self.line_y2)), (0, 255, 255), 5)
        return img

    def draw_counter(self, img):
        font = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = 0.7
        thickness = 2
        img = cv2.putText(img, 'Objects: '+str(self.counter),
                          (img.shape[1]-150, 30), font, font_scale, (0, 255, 255), thickness)
        return img

    def draw_oid(self, img, x1, y1, oid):
        font = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = 0.7
        thickness = 2
        img = cv2.putText(img, str(oid),
                          (x1+10, y1+20), font, font_scale, (0, 255, 255), thickness)
        return img

    def update(self, detections):
        objs = self.tracker.update(np.array(detections))
        counted = []
        for obj in objs:
            x1, y1, x2, y2, oid = obj
            x1 = int(x1)
            x2 = int(x2)
            y1 = int(y1)
            y2 = int(y2)
            oid = int(oid)
            # img = cv2.rectangle(
            #    img, (x1, y1), (x2, y2), (0, 255, 255), 2)
            #img = draw_oid(img, x1, y1, oid)
            #img = cv2.line(img, (int(170/2), int(680/2)), (int(1487/2), int(815/2)), (0, 255, 255), 5)
            #img = draw_counter(img, counter)

            xc = (x1+x2)/2
            yc = (y1+y2)/2
            if oid in self.detected:
                if self.detected[oid]['expired'] is False:
                    if not self.is_same_direction(xc, yc, self.detected[oid]['xc'], self.detected[oid]['yc']):
                        print('*** new object counted', flush=True)
                        self.detected[oid]['expired'] = True
                        print('*** id: ', oid, flush=True)
                        print('***', self.detected[oid], flush=True)
                        print('*** (x, y)', xc, yc, flush=True)
                        self.counter += 1
                        counted.append(self.detected[oid])
                    else:
                        self.detected[oid]['xc'] = xc
                        self.detected[oid]['yc'] = xc
            else:
                self.detected[oid] = {
                    'xc': xc,
                    'yc': yc,
                    'expired': False
                }

        return self.counter, objs, counted

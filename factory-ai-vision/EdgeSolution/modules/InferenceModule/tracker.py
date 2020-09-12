import numpy as np
import cv2
from sort import *

#_m = (170 - 1487) / (680 - 815)
#_b = 680/2 - _m * 170/2
#def compute_direction(_m, _b, x, y):
#    return _m * x + _b - y
#def is_same_direction(x1, y1, x2, y2):
#    return 0.000000001 < (compute_direction(x1, y1) * compute_direction(x2, y2))


def draw_oid(img, x1, y1, oid):
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 0.7
    thickness = 2
    img = cv2.putText(img, str(oid),
                      (x1+10, y1+20), font, font_scale, (0, 255, 255), thickness)
    return img

def draw_counter(img, counter):
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 0.7
    thickness = 2
    img = cv2.putText(img, 'Objects: '+str(counter),
                      (img.shape[1]-150, 30), font, font_scale, (0, 255, 255), thickness)
    return img

class Tracker():

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
            img = cv2.line(img, (int(self.line_x1), int(self.line_y1)), (int(self.line_x2), int(self.line_y2)), (0, 255, 255), 5)
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
            #img = cv2.rectangle(
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

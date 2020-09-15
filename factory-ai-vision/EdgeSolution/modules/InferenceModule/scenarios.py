from collections import namedtuple
import time

import cv2

from tracker import Tracker, Line, Rect
from tracker import bb_intersection_over_union as compute_iou

Detection = namedtuple('Detection', ['tag', 'x1', 'y1', 'x2', 'y2', 'score'])


class Scenario():

    def __init__(self):
        pass

    def update(self):
        raise NotImplementedError

    def reset_metrics(self):
        raise NotImplementedError

    def get_metrics(self):
        raise NotImplementedError


# all objects all counted together
class PartCounter(Scenario):

    def __init__(self, threshold=0.5, max_age=5, min_hits=5, iou_threshold=0.3):
        self.tracker = Tracker(max_age=max_age, min_hits=min_hits, iou_threshold=iou_threshold)
        self.detected = {}
        self.counter = 0
        self.line = None
        self.threshold = threshold

    def set_theshold(self):
        self.threshold = threshold

    def reset_metrics(self):
        self.counter = 0

    def get_metrics(self):
        return [{'name': 'all_objects', 'count': self.counter}]

    def set_line(self, x1, y1, x2, y2):
        self.line = Line(x1, y1, x2, y2)

    def update(self, detections):
        if len(detections) == 0: return
        detections = list(d for d in detections if d.score > self.threshold)
        detections = list(
            [d.x1, d.y1, d.x2, d.y2, d.score] for d in detections)
        self.tracker.update(detections)
        objs = self.tracker.get_objs()
        counted = []
        for obj in objs:
            x1, y1, x2, y2, oid = obj
            xc, yc = compute_center(x1, y1, x2, y2)
            if oid in self.detected:
                if self.detected[oid]['expired'] is False:
                    if self.line and (not self.line.is_same_side(
                            xc, yc, self.detected[oid]['xc'],
                            self.detected[oid]['yc'])):
                        self.detected[oid]['expired'] = True
                        print('*** new object counted', flush=True)
                        print('*** id: ', oid, flush=True)
                        print('***', self.detected[oid], flush=True)
                        print('*** (x, y)', xc, yc, flush=True)
                        self.counter += 1
                        counted.append(self.detected[oid])
                    else:
                        self.detected[oid]['xc'] = xc
                        self.detected[oid]['yc'] = yc
            else:
                self.detected[oid] = {'xc': xc, 'yc': yc, 'expired': False}

        return self.counter, objs, counted

    def draw_counter(self, img):
        font = cv2.FONT_HERSHEY_DUPLEX
        font_scale = 0.7
        thickness = 1
        x = int(max(0, img.shape[1] - 150))
        y = int(min(30, img.shape[0]))
        #print(x, y, flush=True)
        img = cv2.putText(img, 'Objects: ' + str(self.counter), (x, y), font,
                          font_scale, (0, 255, 255), thickness)
        return img

    def draw_constraint(self, img):
        return self.draw_line(img)

    def draw_line(self, img):
        thickness = 1
        if self.line:
            img = cv2.line(img, (int(self.line.x1), int(self.line.y1)),
                           (int(self.line.x2), int(self.line.y2)),
                           (0, 255, 255), thickness)
        return img

    def draw_objs(self, img, is_id=True, is_rect=True):
        for obj in self.tracker.get_objs():
            font = cv2.FONT_HERSHEY_SIMPLEX
            font_scale = 0.7
            thickness = 1
            x1, y1, x2, y2, oid = obj
            x1 = int(x1)
            y1 = int(y1)
            x2 = int(x2)
            y2 = int(y2)
            oid = int(oid)
            x = x1
            y = y1 - 5
            if is_id:
                img = cv2.putText(img, str(oid), (x, y), font, font_scale,
                                  (0, 255, 255), thickness)
            if is_rect:
                img = cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 255),
                                    thickness)
        return img


# support only 1 object with two types (ok/ng) now
class DefeatDetection(Scenario):

    def __init__(self, threshold=0.3, max_age=20, min_hits=5, iou_threshold=0.3):
        self.ok = None
        self.ok_name = 'ok'
        self.ng = None
        self.ng_name = 'ok'
        self.line = None
        self.threshold = threshold
        #self.tracker = Tracker(
        self.tracker = Tracker(max_age=max_age, min_hits=min_hits, iou_threshold=iou_threshold)
        self.detected = {}
        self.ok_counter = 0
        self.ng_counter = 0

    def set_threshold(self):
        self.threshold = threshold

    def reset_metrics(self):
        if self.ok:
            self.ok.reset_metrics()
        if self.ng:
            self.ng.reset_metrics()

    def get_metrics(self):
        metrics = []
        #if self.ok:
        metrics.append({'name': self.ok_name, 'count': self.ok_counter})
        #if self.ng:
        metrics.append({'name': self.ng_name, 'count': self.ng_counter})
        return metrics

    def set_ok(self, name):
        self.ok = PartCounter(threshold=0.5, max_age=5, min_hits=5, iou_threshold=0.3)
        self.ok_name = name
        if self.line:
            self.ok.set_line(self.line.x1, self.line.y1, self.line.x2,
                             self.line.y2)

    def set_ng(self, name):
        self.ng = PartCounter(threshold=0.5, max_age=5, min_hits=5, iou_threshold=0.3)
        self.ng_name = name
        if self.line:
            self.ng.set_line(self.line.x1, self.line.y1, self.line.x2,
                             self.line.y2)

    def set_line(self, x1, y1, x2, y2):
        self.line = Line(x1, y1, x2, y2)
        if self.ok: self.ok.set_line(x1, y1, x2, y2)
        if self.ng: self.ng.set_line(x1, y1, x2, y2)

    def update(self, detections):
        detections = list(d for d in detections if d.score > self.threshold)
        # delete overlayed ok & ng
        found = True
        while found:
            found = False
            if len(detections) < 2: break
            for i in range(len(detections)-1):
                box1 = [detections[i].x1, detections[i].y1, detections[i].x2, detections[i].y2]
                box2 = [detections[i+1].x1, detections[i+1].y1, detections[i+1].x2, detections[i+1].y2]
                if compute_iou(box1, box2) > 0.3:
                    if detections[i].score < detections[i+1].score:
                        del detections[i]
                    else:
                        del detections[i+1]
                    Found = True
                    print('delete', i)
                    break

        _detections = list(
            [d.x1, d.y1, d.x2, d.y2, d.score] for d in detections)
        self.tracker.update(_detections)
        objs = self.tracker.get_objs()


        for obj in objs:
            x1, y1, x2, y2, oid = obj
            tag = self.ok_name
            box1 = [x1, y1, x2, y2]
            got = False
            for d in detections:
                box2 = [d.x1, d.y1, d.x2, d.y2]
                print(box1, box2)
                iou = compute_iou(box1, box2)
                print('iou', iou)
                if iou > 0.3:
                    print('get u bitch', d.tag)
                    tag = d.tag
                    break

            xc, yc = compute_center(x1, y1, x2, y2)

            if oid in self.detected:
                if tag == self.ng_name: self.detected[oid]['tag'] = tag
                if self.detected[oid]['expired'] is False:
                    if self.line and (not self.line.is_same_side(
                            xc, yc, self.detected[oid]['xc'],
                            self.detected[oid]['yc'])):
                        self.detected[oid]['expired'] = True
                        print('*** new object counted', flush=True)
                        print('*** id: ', oid, flush=True)
                        print('***', self.detected[oid], flush=True)
                        print('*** (x, y)', xc, yc, flush=True)
                        if self.detected[oid]['tag'] == self.ok_name:
                            self.ok_counter += 1
                        elif self.detected[oid]['tag'] == self.ng_name:
                            self.ng_counter += 1
                        #counted.append(self.detected[oid])
                    else:
                        self.detected[oid]['xc'] = xc
                        self.detected[oid]['yc'] = yc
            else:
                self.detected[oid] = {'xc': xc, 'yc': yc, 'expired': False, 'tag': tag}


    def update2(self, detections):
        #print(detections)
        #print('== update begin ==')
        #for d in detections:
        #    print(d)
        detections = list(d for d in detections if d.score > self.threshold)
        #for d in detections:
        #    print(d)
        #print(detections)
        if self.ok and self.ng:
            found = True
            while found:
                found = False
                if len(detections) < 2: break
                for i in range(len(detections)-1):
                    box1 = [detections[i].x1, detections[i].y1, detections[i].x2, detections[i].y2]
                    box2 = [detections[i+1].x1, detections[i+1].y1, detections[i+1].x2, detections[i+1].y2]
                    if iou(box1, box2) > 0.1:
                        if detections[i].score < detections[i+1].score:
                            del detections[i]
                        else:
                            del detections[i+1]
                        Found = True
                        print('delete', i)
                        break
            #print('aft')
            #for d in detections:
            #    print(d)

            ok_detections = list(
                d for d in detections if d.tag == self.ok_name)
            ng_detections = list(
                d for d in detections if d.tag == self.ng_name)

        elif self.ok:
            ok_detections = list(
                d for d in detections if d.tag == self.ok_name)
            if len(ok_detections) > 0:
                self.ok.update(ok_detections)

        elif self.ng:
            ng_detections = list(
                d for d in detections if d.tag == self.ng_name)
            if len(ng_detections) > 0:
                self.ng.update(ng_detections)

    def draw_counter(self, img):
        font = cv2.FONT_HERSHEY_DUPLEX
        font_scale = 0.5
        thickness = 1
        x = int(max(0, img.shape[1] - 200))
        y = int(min(30, img.shape[0]))
        #if self.ok:
        #    img = cv2.putText(img, self.ok_name + ': ' + str(self.ok.counter),
        #                      (x, y), font, font_scale, (0, 255, 255),
        #                      thickness)
        #if self.ng:
        #    img = cv2.putText(img, self.ng_name + ': ' + str(self.ng.counter),
        #                      (x, y + 15), font, font_scale, (0, 255, 255),
        #                      thickness)
        img = cv2.putText(img, self.ok_name + ': ' + str(self.ok_counter),
                            (x, y), font, font_scale, (0, 255, 255),
                            thickness)
        img = cv2.putText(img, self.ng_name + ': ' + str(self.ng_counter),
                            (x, y + 15), font, font_scale, (0, 255, 255),
                            thickness)

        return img

    def draw_constraint(self, img):
        return self.draw_line(img)

    def draw_line(self, img):
        thickness = 1
        if self.line:
            img = cv2.line(img, (int(self.line.x1), int(self.line.y1)),
                           (int(self.line.x2), int(self.line.y2)),
                           (0, 255, 255), thickness)

    def draw_objs(self, img, is_id=True, is_rect=True, is_tag=True):
        for obj in self.tracker.get_objs():
            font = cv2.FONT_HERSHEY_SIMPLEX
            font_scale = 0.7
            thickness = 1
            x1, y1, x2, y2, oid = obj
            x1 = int(x1)
            y1 = int(y1)
            x2 = int(x2)
            y2 = int(y2)
            oid = int(oid)
            x = x1
            y = y1 - 5
            if is_id:
                img = cv2.putText(img, str(oid), (x, y), font, font_scale,
                                  (0, 255, 255), thickness)
            if is_rect:
                img = cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 255),
                                    thickness)
        return img


class DangerZone(Scenario):

    def __init__(self, threshold=0.5, max_age=20, min_hits=10, iou_threshold=0.5):
        self.tracker = Tracker(max_age=max_age, min_hits=min_hits, iou_threshold=iou_threshold)
        self.detected = {}
        self.counter = 0
        self.zones = []
        self.targets = []
        self.threshold = threshold

    def set_treshold(self):
        self.threshold = threshold

    def reset_metrics(self):
        self.counter = 0

    def set_targets(self, targets):
        self.targets = targets

    def get_metrics(self):
        return [{'name': 'violation', 'count': self.counter}]

    def set_zones(self, zones):
        self.zones = []
        for zone in zones:
            x1, y1, x2, y2 = zone
            self.zones.append(Rect(x1, y1, x2, y2))

    def is_inside_zones(self, x1, y1, x2, y2):
        for zone in self.zones:
            if zone.is_inside(x1, y1, x2, y2): return True
        return False

    def update(self, detections):
        detections = list(d for d in detections if d.score > self.threshold)
        detections = list([d.x1, d.y1, d.x2, d.y2, d.score]
                          for d in detections
                          if d.tag in self.targets)
        if len(detections) == 0: return

        self.tracker.update(detections)
        objs = self.tracker.get_objs()
        counted = []
        for obj in objs:
            x1, y1, x2, y2, oid = obj
            if oid in self.detected:
                if self.detected[oid]['expired'] is False:
                    if self.is_inside_zones(x1, y1, x2, y2):
                        self.detected[oid]['expired'] = True
                        print('*** new object counted', flush=True)
                        self.counter += 1
                        #counted.append(self.detected[oid])
                    else:
                        self.detected[oid]['x1'] = x1
                        self.detected[oid]['y1'] = y1
                        self.detected[oid]['x2'] = x2
                        self.detected[oid]['y2'] = y2
            else:
                self.detected[oid] = {
                    'x1': x1,
                    'y1': y1,
                    'x2': x2,
                    'y2': y2,
                    'expired': False
                }

        return self.counter, objs, counted

    def draw_counter(self, img):
        font = cv2.FONT_HERSHEY_DUPLEX
        font_scale = 0.7
        thickness = 1
        x = int(max(0, img.shape[1] - 200))
        y = int(min(30, img.shape[0]))
        img = cv2.putText(img, 'Violations: ' + str(self.counter), (x, y),
                          font, font_scale, (0, 255, 255), thickness)
        return img

    def draw_constraint(self, img):
        return self.draw_zones(img)

    def draw_zones(self, img):
        thickness = 1
        for zone in self.zones:
            img = cv2.rectangle(img, (int(zone.x1), int(zone.y1)),
                                (int(zone.x2), int(zone.y2)), (0, 255, 255),
                                thickness)
        return img

    def draw_objs(self, img, is_id=True, is_rect=True):
        for obj in self.tracker.get_objs():
            font = cv2.FONT_HERSHEY_SIMPLEX
            font_scale = 0.7
            thickness = 1
            x1, y1, x2, y2, oid = obj
            x1 = int(x1)
            y1 = int(y1)
            x2 = int(x2)
            y2 = int(y2)
            oid = int(oid)
            x = x1
            y = y1 - 5
            if is_id:
                img = cv2.putText(img, str(oid), (x, y), font, font_scale,
                                  (0, 255, 255), thickness)
            if is_rect:
                img = cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 255),
                                    thickness)
        return img


def compute_center(x1, y1, x2, y2):
    return (x1 + x2) / 2, (y1 + y2) / 2

import time
from collections import namedtuple

import cv2
import datetime

from dateutil import parser
from tracker import Line, Rect, Tracker, Polygon_obj
from shapely.geometry import Polygon
from tracker import bb_intersection_over_union as compute_iou
from utility import draw_label

Detection = namedtuple("Detection", ["tag", "x1", "y1", "x2", "y2", "score"])


class Scenario:
    def __init__(self):
        pass

    def update(self):
        raise NotImplementedError

    def reset_metrics(self):
        raise NotImplementedError

    def get_metrics(self):
        raise NotImplementedError


class PartDetection(Scenario):
    def __init__(self, threshold=0.3, max_age=5, min_hits=2, iou_threshold=0.3):
        # self.tracker = Tracker(
        #    max_age=max_age, min_hits=min_hits, iou_threshold=iou_threshold
        # )
        self.detected = {}
        self.counter = 0
        self.threshold = threshold
        self.max_age = max_age
        self.min_hits = min_hits
        self.iou_threshold = iou_threshold
        self.trackers = {}
        self.parts = []

    def set_threshold(self, threshold):
        self.threshold = threshold

    def set_parts(self, parts):
        self.parts = parts
        self.trackers = {}
        for part in parts:
            self.trackers[part] = Tracker(
                max_age=self.max_age, min_hits=self.min_hits, iou_threshold=self.iou_threshold
            )
        # print(self.parts)

    def update(self, detections):
        for part in self.parts:
            _detections = list(d for d in detections if (
                d.score > self.threshold and d.tag in self.parts))
            _detections = list([d.x1, d.y1, d.x2, d.y2, d.score]
                               for d in _detections)
            self.trackers[part].update(_detections)
            #objs = self.tracker.get_objs()
            return []

    def reset_metrics(self):
        return

    def get_metrics(self):
        return []

    def draw_counter(self, img):
        return

    def draw_constraint(self, img):
        return

    def draw_objs(self, img, is_id=True, is_rect=True):
        for part in self.parts:
            # print(part)
            for obj in self.trackers[part].get_objs():
                # print(obj)
                font = cv2.FONT_HERSHEY_DUPLEX
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
                    img = draw_label(img, str(part), (x, y))
                if is_rect:
                    img = cv2.rectangle(
                        img, (x1, y1), (x2, y2), (255, 255, 255), thickness)
        return img


# all objects all counted together
class PartCounter(Scenario):
    def __init__(self, threshold=0.5, max_age=5, min_hits=5, iou_threshold=0.3):
        self.tracker = Tracker(
            max_age=max_age, min_hits=min_hits, iou_threshold=iou_threshold
        )
        self.detected = {}
        self.counter = {}
        self.line = []
        self.max_people = 5
        self.threshold = threshold

    def set_max_people(self, max_people):
        self.max_people = max_people

    def set_threshold(self, threshold):
        self.threshold = threshold

    def reset_metrics(self):
        for i in self.counter:
            self.counter[i] = 0
        # self.counter = 0

    def get_metrics(self):
        return [{"name": "all_objects", "count": self.counter}]

    def set_line(self, lines):
        lines_ = []
        for line in lines:
            l = Line(line[0], line[1], line[2], line[3])
            lines_.append(l)
            l.id = line[4]
            self.counter[l.id] = 0
        self.line = lines_

    def update(self, detections):
        if len(detections) == 0:
            return [0]
        detections = list(d for d in detections if d.score > self.threshold)
        detections = list([d.x1, d.y1, d.x2, d.y2, d.score]
                          for d in detections)
        self.tracker.update(detections)
        objs = self.tracker.get_objs()
        counted = []
        for obj in objs:
            x1, y1, x2, y2, oid = obj
            xc, yc = compute_center(x1, y1, x2, y2)
            if oid in self.detected:
                for line in self.line:
                    if line.id not in self.detected[oid]["expired"].keys():
                        self.detected[oid]["expired"][line.id] = False
                    if self.detected[oid]["expired"][line.id] is False:
                        if line and (
                            not line.is_same_side(
                                xc, yc, self.detected[oid]["xc"], self.detected[oid]["yc"]
                            )
                        ):
                            self.detected[oid]["expired"][line.id] = True
                            print("*** new object counted", flush=True)
                            print("*** id: ", oid, flush=True)
                            print("***", self.detected[oid], flush=True)
                            print("*** (x, y)", xc, yc, flush=True)
                            self.counter[line.id] += 1
                            counted.append(self.detected[oid])
                self.detected[oid]["xc"] = xc
                self.detected[oid]["yc"] = yc
            else:
                self.detected[oid] = {"xc": xc, "yc": yc, "expired": {}}

        return [self.counter, objs, counted]

    def draw_counter(self, img):
        font = cv2.FONT_HERSHEY_DUPLEX
        font_scale = 0.7
        thickness = 1
        x = int(max(0, img.shape[1] - 250))
        y = int(min(30, img.shape[0]))
        # print(x, y, flush=True)
        for i in self.counter:

            img = cv2.putText(
                img,
                "Objects(Line {}): {}".format(i, str(self.counter[i])),
                (x, y),
                font,
                font_scale,
                (255, 255, 255),
                thickness,
            )
            y += 25
        return img

    def draw_constraint(self, img):
        return self.draw_line(img)

    def draw_line(self, img):
        thickness = 1
        if self.line:
            img = cv2.line(
                img,
                (int(self.line.x1), int(self.line.y1)),
                (int(self.line.x2), int(self.line.y2)),
                (255, 255, 255),
                thickness,
            )
        return img

    def draw_objs(self, img, is_id=True, is_rect=True):
        for obj in self.tracker.get_objs():
            font = cv2.FONT_HERSHEY_DUPLEX
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
                img = draw_label(img, str(oid), (x, y))
            if is_rect:
                img = cv2.rectangle(img, (x1, y1), (x2, y2),
                                    (255, 255, 255), thickness)
        return img


# support only 1 object with two types (ok/ng) now
class DefeatDetection(Scenario):
    def __init__(self, threshold=0.35, max_age=5, min_hits=1, iou_threshold=0.2):
        self.ok = None
        self.ok_name = "ok"
        self.ng = None
        self.ng_name = "ng"
        self.line = None
        self.threshold = threshold
        self.tracker = Tracker(
            max_age=max_age, min_hits=min_hits, iou_threshold=iou_threshold
        )
        self.max_people = 5
        self.detected = {}
        self.ok_counter = 0
        self.ng_counter = 0
        self.objs_with_labels = []

    def set_max_people(self, max_people):
        self.max_people = max_people

    def set_threshold(self, threshold):
        self.threshold = threshold

    def reset_metrics(self):
        self.ok_counter = 0
        self.ng_counter = 0

    def get_metrics(self):
        metrics = []
        metrics.append({"name": self.ok_name, "count": self.ok_counter})
        metrics.append({"name": self.ng_name, "count": self.ng_counter})
        return metrics

    def set_ok(self, name):
        self.ok_name = name

    def set_ng(self, name):
        self.ng_name = name

    def set_line(self, x1, y1, x2, y2):
        self.line = Line(x1, y1, x2, y2)

    def update(self, detections):
        detections = list(d for d in detections if d.score > self.threshold)
        # delete overlayed ok & ng
        found = True
        while found:
            found = False
            if len(detections) < 2:
                break
            for i in range(len(detections) - 1):
                box1 = [
                    detections[i].x1,
                    detections[i].y1,
                    detections[i].x2,
                    detections[i].y2,
                ]
                box2 = [
                    detections[i + 1].x1,
                    detections[i + 1].y1,
                    detections[i + 1].x2,
                    detections[i + 1].y2,
                ]
                if compute_iou(box1, box2) > 0.3:
                    if detections[i].score < detections[i + 1].score:
                        del detections[i]
                    else:
                        del detections[i + 1]
                    Found = True
                    print("delete overlayed obj", i)
                    break

        _detections = list([d.x1, d.y1, d.x2, d.y2, d.score]
                           for d in detections)
        self.tracker.update(_detections)
        objs = self.tracker.get_objs()

        for obj in objs:
            x1, y1, x2, y2, oid = obj
            tag = self.ok_name
            score = 0.0
            box1 = [x1, y1, x2, y2]
            got = False
            for d in detections:
                box2 = [d.x1, d.y1, d.x2, d.y2]
                iou = compute_iou(box1, box2)
                if iou > 0.3:
                    tag = d.tag
                    score = d.score
                    break

            xc, yc = compute_center(x1, y1, x2, y2)

            if oid in self.detected:
                self.detected[oid]["score"] = score
                if tag == self.ng_name:
                    self.detected[oid]["tag"] = tag
                if self.detected[oid]["expired"] is False:
                    if self.line and (
                        not self.line.is_same_side(
                            xc, yc, self.detected[oid]["xc"], self.detected[oid]["yc"]
                        )
                    ):
                        self.detected[oid]["expired"] = True
                        if self.detected[oid]["tag"] == self.ok_name:
                            self.ok_counter += 1
                        elif self.detected[oid]["tag"] == self.ng_name:
                            self.ng_counter += 1
                        # counted.append(self.detected[oid])
                    else:
                        self.detected[oid]["xc"] = xc
                        self.detected[oid]["yc"] = yc
            else:
                self.detected[oid] = {
                    "xc": xc,
                    "yc": yc,
                    "expired": False,
                    "tag": tag,
                    "score": score,
                }
        return [{self.ok_name: self.ok_counter, self.ng_name: self.ng_counter}]

    def draw_counter(self, img):
        font = cv2.FONT_HERSHEY_DUPLEX
        font_scale = 0.5
        thickness = 1
        x = int(max(0, img.shape[1] - 200))
        y = int(min(30, img.shape[0]))

        img = cv2.putText(
            img,
            self.ok_name + ": " + str(self.ok_counter),
            (x, y),
            font,
            font_scale,
            (255, 255, 255),
            thickness,
        )
        img = cv2.putText(
            img,
            self.ng_name + ": " + str(self.ng_counter),
            (x, y + 15),
            font,
            font_scale,
            (0, 0, 255),
            thickness,
        )

        return img

    def draw_constraint(self, img):
        return self.draw_line(img)

    def draw_line(self, img):
        thickness = 1
        if self.line:
            img = cv2.line(
                img,
                (int(self.line.x1), int(self.line.y1)),
                (int(self.line.x2), int(self.line.y2)),
                (255, 255, 255),
                thickness,
            )

    def draw_objs(self, img, is_id=False, is_rect=True, is_tag=True):
        for obj in self.tracker.get_objs():
            font = cv2.FONT_HERSHEY_SIMPLEX
            font_scale = 0.3
            thickness = 1
            x1, y1, x2, y2, oid = obj
            x1 = int(x1)
            y1 = int(y1)
            x2 = int(x2)
            y2 = int(y2)
            oid = int(oid)
            rectangle_color = (255, 255, 255)
            text_color = (0, 0, 0)

            tag = self.detected[oid]["tag"]
            if tag == "Bottle - NG":
                rectangle_color = (0, 0, 255)
                text_color = (255, 255, 255)

            if is_id:
                # img = cv2.putText(img, str(oid), (x, y), font, font_scale,
                #                  (0, 255, 255), thickness)
                img = draw_label(img, str(oid), (x1, y1))
            if is_tag:
                score = self.detected[oid]["score"]
                text = tag + " ( " + str(int(1000 * score) / 10) + "% )"
                img = draw_label(
                    img, text, (x1, max(y1, 15)), rectangle_color, text_color
                )
            if is_rect:
                img = cv2.rectangle(
                    img, (x1, max(y1, 15)), (x2, y2), rectangle_color, thickness
                )
                # img = cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 255),
                #                    thickness)
        return img


class DangerZone(Scenario):
    def __init__(self, threshold=0.5, max_age=20, min_hits=10, iou_threshold=0.5):
        self.tracker = Tracker(
            max_age=max_age, min_hits=min_hits, iou_threshold=iou_threshold
        )
        self.detected = {}
        self.counter = {}
        self.current_counter = {}
        self.zones = []
        self.targets = []
        self.threshold = threshold
        self.has_new_event = False
        self.max_people = 5
        self.counting_start_time = ''
        self.counting_end_time = ''

    def set_time(self, counting_start_time, counting_end_time):
        self.counting_start_time = parser.parse(
            counting_start_time).replace(tzinfo=None)
        self.counting_end_time = parser.parse(
            counting_end_time).replace(tzinfo=None)

    def set_max_people(self, max_people):
        self.max_people = max_people

    def set_threshold(self, threshold):
        self.threshold = threshold

    def reset_metrics(self):
        # self.counter = 0
        for i in self.counter:
            self.counter[i] = {'current': 0, 'total': 0}

    def set_targets(self, targets):
        self.targets = targets

    def get_metrics(self):
        return [{"name": "violation", "count": self.counter}]

    def set_zones(self, zones):
        self.zones = []
        # for zone in zones:
        #     x1, y1, x2, y2, zone_id = zone
        #     _zone = Rect(x1, y1, x2, y2)
        #     _zone.id = zone_id

        for zone in zones:
            zone_type = zone["type"]
            label = zone["label"]
            zone_id = zone["order"]

            if zone_type == "BBox":
                x1 = label['x1']
                x2 = label['x2']
                y1 = label['y1']
                y2 = label['y2']
                _zone = Polygon_obj([[x1, y1], [x2, y1], [x2, y2], [x1, y2]])
                _zone.id = zone_id

            elif zone_type == "Polygon":
                points = []
                for point in label:
                    points.append([point["x"], point["y"]])
                _zone = Polygon_obj(points)
                _zone.id = zone_id

            self.counter[_zone.id] = {'current': 0, 'total': 0}
            self.zones.append(_zone)

    def is_inside_zones(self, x1, y1, x2, y2):
        # obj_shape = Polygon([[x1, y1], [x2, y1], [x2, y2], [x1, y2]])
        for zone in self.zones:
            if zone.is_inside(x1, y1, x2, y2):
                # if zone.is_valid and zone.intersects(obj_shape):
                return True
        return False

    def update(self, detections):
        detections = list(d for d in detections if d.score > self.threshold)
        detections = list(
            [d.x1, d.y1, d.x2, d.y2, d.score]
            for d in detections
            if d.tag in self.targets
        )

        self.tracker.update(detections)
        objs = self.tracker.get_objs()
        counted = []
        has_new_event = False
        # reset current counter
        for zone in self.zones:
            self.counter[zone.id]['current'] = 0

        for obj in objs:
            x1, y1, x2, y2, oid = obj
            if oid in self.detected:
                for zone in self.zones:
                    if zone.is_inside(x1, y1, x2, y2):
                        self.counter[zone.id]['current'] += 1
                    if zone.id not in self.detected[oid]["expired"].keys():
                        self.detected[oid]["expired"][zone.id] = False
                    if self.detected[oid]["expired"][zone.id] is False:
                        if zone.is_inside(x1, y1, x2, y2):
                            self.detected[oid]["expired"][zone.id] = True
                            print("*** new object counted", flush=True)
                            has_new_event = True
                            self.counter[zone.id]['total'] += 1
                            # counted.append(self.detected[oid])
                self.detected[oid]["x1"] = x1
                self.detected[oid]["y1"] = y1
                self.detected[oid]["x2"] = x2
                self.detected[oid]["y2"] = y2
            else:
                self.detected[oid] = {
                    "x1": x1,
                    "y1": y1,
                    "x2": x2,
                    "y2": y2,
                    "expired": {},
                }
        self.has_new_event = has_new_event

        return [self.counter, objs, counted]

    def draw_counter(self, img):
        font = cv2.FONT_HERSHEY_DUPLEX
        font_scale = 0.7
        thickness = 1
        x = int(max(0, img.shape[1] - 400))
        y = int(min(30, img.shape[0]))
        for i in self.counter:
            img = cv2.putText(
                img,
                "Zone {} - Current: {}, Total: {}".format(i,
                                                          str(self.counter[i]['current']), str(self.counter[i]['total'])),
                (x, y),
                font,
                font_scale,
                (255, 255, 255),
                thickness,
            )
            y += 25
        return img

    def draw_constraint(self, img):
        return self.draw_zones(img)

    def draw_zones(self, img):
        thickness = 1
        for zone in self.zones:
            img = cv2.rectangle(
                img,
                (int(zone.x1), int(zone.y1)),
                (int(zone.x2), int(zone.y2)),
                (255, 255, 255),
                thickness,
            )
        return img

    def draw_objs(self, img, is_id=True, is_rect=True):
        for obj in self.tracker.get_objs():
            font = cv2.FONT_HERSHEY_DUPLEX
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
                img = draw_label(img, str(oid), (x, y))
            if is_rect:
                img = cv2.rectangle(img, (x1, y1), (x2, y2),
                                    (255, 255, 255), thickness)
        return img


class ShelfZone(DangerZone):
    def __init__(self, threshold=0.3, max_age=1, min_hits=1, iou_threshold=0.5):
        super(ShelfZone, self).__init__(threshold=0.3,
                                        max_age=1, min_hits=1, iou_threshold=0.5)
        self.is_empty = False

    def update(self, detections):
        detections = list(d for d in detections if d.score > self.threshold)
        detections = list(
            [d.x1, d.y1, d.x2, d.y2, d.score]
            for d in detections
            if d.tag in self.targets
        )

        self.tracker.update(detections)
        objs = self.tracker.get_objs()
        counted = []
        has_new_event = False
        self.is_empty = False
        # reset current counter
        for zone in self.zones:
            self.counter[zone.id]['current'] = 0

        # for detection in detections:
        #     for zone in self.zones:
        #         x1, y1, x2, y2, score = detection
        #         if zone.is_inside(x1, y1, x2, y2):
        #             self.counter[zone.id]['current'] += 1

        empty_count = len(detections)
        if empty_count > 0:
            self.has_new_event = True
            self.is_empty = True

        return [empty_count]

    def draw_counter(self, img):
        font = cv2.FONT_HERSHEY_DUPLEX
        font_scale = 0.7
        thickness = 1
        x = int(max(0, img.shape[1] - 200))
        y = int(min(30, img.shape[0]))
        # for i in self.counter:
        #     if self.counter[i]['current'] == 0:
        #         self.has_new_event = True
        #         img = cv2.putText(
        #             img,
        #             "Zone {}: Empty Shelf".format(i),
        #             (x, y),
        #             font,
        #             font_scale,
        #             (0, 0, 255),
        #             thickness,
        #         )
        #         y += 25

        if self.is_empty:
            img = cv2.putText(
                img,
                "Empty Shelf",
                (x, y),
                font,
                font_scale,
                (0, 0, 255),
                thickness,
            )
        return img


class CountingZone(DangerZone):

    def update(self, detections):
        detections = list(d for d in detections if d.score > self.threshold)
        detections = list(
            [d.x1, d.y1, d.x2, d.y2, d.score]
            for d in detections
            if d.tag in self.targets
        )

        self.tracker.update(detections)
        objs = self.tracker.get_objs()
        counted = []
        has_new_event = False
        # reset current counter
        for zone in self.zones:
            self.counter[zone.id]['current'] = 0

        for detection in detections:
            for zone in self.zones:
                x1, y1, x2, y2, score = detection
                if zone.is_inside(x1, y1, x2, y2):
                    self.counter[zone.id]['current'] += 1

        for obj in objs:
            x1, y1, x2, y2, oid = obj
            if oid in self.detected:
                for zone in self.zones:
                    # count current object according to original detections (above)
                    # if zone.is_inside(x1, y1, x2, y2):
                    #     self.counter[zone.id]['current'] += 1
                    if zone.id not in self.detected[oid]["expired"].keys():
                        self.detected[oid]["expired"][zone.id] = False
                    if self.detected[oid]["expired"][zone.id] is False:
                        if zone.is_inside(x1, y1, x2, y2):
                            self.detected[oid]["expired"][zone.id] = True
                            print("*** new object counted", flush=True)
                            # compare time with end_time
                            if datetime.datetime.utcnow() < self.counting_end_time:
                                self.counter[zone.id]['total'] += 1
                            else:
                                has_new_event = True
                            # counted.append(self.detected[oid])
                self.detected[oid]["x1"] = x1
                self.detected[oid]["y1"] = y1
                self.detected[oid]["x2"] = x2
                self.detected[oid]["y2"] = y2
            else:
                self.detected[oid] = {
                    "x1": x1,
                    "y1": y1,
                    "x2": x2,
                    "y2": y2,
                    "expired": {},
                }
        self.has_new_event = has_new_event

        return [self.counter, objs, counted]


class QueueZone(DangerZone):
    # def __init__(self, threshold=0.5, max_age=1, min_hits=1, iou_threshold=0.5):
    #     super(ShelfZone, self).__init__(threshold=0.5,
    #                                     max_age=1, min_hits=1, iou_threshold=0.5)

    def update(self, detections):
        detections = list(d for d in detections if d.score > self.threshold)
        detections = list(
            [d.x1, d.y1, d.x2, d.y2, d.score]
            for d in detections
            if d.tag in self.targets
        )

        self.tracker.update(detections)
        objs = self.tracker.get_objs()
        counted = []
        has_new_event = False
        # reset current counter
        for zone in self.zones:
            self.counter[zone.id]['current'] = 0

        for detection in detections:
            for zone in self.zones:
                x1, y1, x2, y2, score = detection
                if zone.is_inside(x1, y1, x2, y2):
                    self.counter[zone.id]['current'] += 1

        queue_total = 0
        for i in self.counter:
            queue_total += self.counter[i]['current']
        if queue_total > self.max_people:
            has_new_event = True

        self.has_new_event = has_new_event

        return [self.counter]

    def draw_counter(self, img):
        font = cv2.FONT_HERSHEY_DUPLEX
        font_scale = 0.7
        thickness = 1
        x = int(max(0, img.shape[1] - 450))
        y = int(min(30, img.shape[0]))
        queue_total = 0
        for i in self.counter:
            queue_total += self.counter[i]['current']

        if queue_total > self.max_people:
            font_color = (0, 0, 255)
        else:
            font_color = (255, 255, 255)

        img = cv2.putText(
            img,
            "Total Number of People in Queue: {}".format(str(queue_total)),
            (x, y),
            font,
            font_scale,
            font_color,
            thickness,
        )
        return img


def compute_center(x1, y1, x2, y2):
    return (x1 + x2) / 2, (y1 + y2) / 2

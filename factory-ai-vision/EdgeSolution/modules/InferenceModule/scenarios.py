import cv2

from tracker import Tracker, Line, Detection

class Scenario():
    def __init__(self):
        pass

    def update(self):
        raise NotImplementedError

# all objects all counted together
class PartCounter(Scenario):
    def __init__(self, theshold=0.5):
        self.tracker = Tracker()
        self.detected = {}
        self.counter = 0
        self.line = None

    def set_line(self, x1, y1, x2, y2):
        self.line = Line(x1, y1, x2, y2)


    def update(self, detections):
        self.tracker.update(detections)
        objs = self.tracker.get_objs()
        counted = []
        for obj in objs:
            x1, y1, x2, y2, oid = obj
            x1 = int(x1)
            x2 = int(x2)
            y1 = int(y1)
            y2 = int(y2)
            oid = int(oid)

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

    def draw_counter(self, img):
        font = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = 0.7
        thickness = 2
        x = max(0, img.shape[1]-150)
        y = min(30, img.shape[0])
        img = cv2.putText(img, 'Objects: '+str(self.counter), (x, y), font, font_scale, (0, 255, 255), thickness)
        return img


# support only 1 object with two types (ok/ng) now
class DefeatDetection(Scenario):
    def __init__(self):
        self.ok = None
        self.ng = None
        pass

    def set_ok(self):
        pass

    def set_ng(self):
        pass

    def update(self):
        pass

class DangerZone(Scenario):
    def __init__(self):
        pass

    def update(self):
        pass

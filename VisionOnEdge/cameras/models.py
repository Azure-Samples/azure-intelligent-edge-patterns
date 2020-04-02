from django.db import models
import cv2


# Create your models here.

class Camera(models.Model):
    name = models.CharField(max_length=200)
    rtsp = models.CharField(max_length=1000)
    model_name = models.CharField(max_length=200)

class Image(models.Model):
    image = models.ImageField(upload_to='images/')


# FIXME consider move this out of models.py
class Stream(object):
    def __init__(self, rtsp):
        if rtsp == '0': self.rtsp = 0
        elif rtsp == '1': self.rtsp = 1
        else: self.rtsp = rtsp

        #self.last_active = datetime.datetime.now()
        self.status = 'init'
        self.last_img = None
        self.id = id(self)

    def gen(self):
        self.status = 'running'
        print('[INFO] start streaming with', self.rtsp)
        self.cap = cv2.VideoCapture(self.rtsp)
        while self.status == 'running':
            t, img = self.cap.read()
            img = cv2.resize(img, None, fx=0.5, fy=0.5)
            self.last_img = img
            yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + cv2.imencode('.jpg', img)[1].tobytes() + b'\r\n')
        self.cap.release()


    def get_frame(self):
        print('[INFO] get frame', self)
        b, img = self.cap.read()
        if b: return cv2.imencode('.jpg', img)[1].tobytes()
        else : return None


    def close(self):
        self.status = 'stopped'
        print('[INFO] release', self)

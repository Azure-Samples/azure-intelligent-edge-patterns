import datetime
import time
import threading


from django.db import models
from django.db.models.signals import post_save, post_delete, pre_save, post_save, m2m_changed
import cv2
import requests

from azure.cognitiveservices.vision.customvision.training import CustomVisionTrainingClient
from azure.cognitiveservices.vision.customvision.training.models import ImageFileCreateEntry, Region

from vision_on_edge.settings import TRAINING_KEY, ENDPOINT
trainer = CustomVisionTrainingClient(TRAINING_KEY, endpoint=ENDPOINT)

is_trainer_valid = True

# Classification, General (compact) for classiciation
try:
    obj_detection_domain = next(domain for domain in trainer.get_domains() if domain.type == "ObjectDetection" and domain.name == "General (compact)")
except:
    is_trainer_valid = False



# Create your models here.
class Part(models.Model):
    name = models.CharField(max_length=200)
    description = models.CharField(max_length=1000)
    def __str__(self):
        return self.name

class Location(models.Model):
    name = models.CharField(max_length=200)
    description = models.CharField(max_length=1000)
    coordinates = models.CharField(max_length=200)
    def __str__(self):
        return self.name

class Camera(models.Model):
    name = models.CharField(max_length=200)
    rtsp = models.CharField(max_length=1000)
    model_name = models.CharField(max_length=200)

class Image(models.Model):
    image = models.ImageField(upload_to='images/')
    part = models.ForeignKey(Part, on_delete=models.CASCADE)
    labels = models.CharField(max_length=1000, null=True)

class Annotation(models.Model):
    image = models.OneToOneField(Image, on_delete=models.CASCADE)
    labels = models.CharField(max_length=1000, null=True)

class Setting(models.Model):
    training_key = models.CharField(max_length=1000, blank=True)
    endpoint = models.CharField(max_length=1000, blank=True)
    iot_hub_connection_string = models.CharField(max_length=1000, blank=True)
    device_id = models.CharField(max_length=1000, blank=True)
    module_id = models.CharField(max_length=1000, blank=True)

class Project(models.Model):
    camera = models.ForeignKey(Camera, on_delete=models.CASCADE)
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    parts = models.ManyToManyField(
                Part, related_name='part')
    customvision_project_id = models.CharField(max_length=200)
    customvision_project_name = models.CharField(max_length=200)
    download_uri = models.CharField(max_length=1000, null=True, blank=True)
    training_key = models.CharField(max_length=1000, blank=True)
    endpoint = models.CharField(max_length=1000, blank=True)
    needRetraining = models.BooleanField(default=False)
    accuracyRangeMin = models.IntegerField()
    accuracyRangeMax = models.IntegerField()
    maxImages = models.IntegerField()

    @staticmethod
    def pre_save(sender, instance, update_fields, **kwargs):
        if update_fields is not None: return
        print('update_fields:', update_fields)
        if instance.id is not None: return
        print('[INFO] Creating Project on Custom Vision')
        name = 'VisionOnEdge-' + datetime.datetime.utcnow().isoformat()
        instance.customvision_project_name = name
        print('instance pre:', instance)

        if is_trainer_valid:
            project = trainer.create_project(name, domain_id=obj_detection_domain.id)
            print('[INFO] Got Custom Vision Project ID', project.id)
            instance.customvision_project_id = project.id
        else:
            print('[INFO] Has not set the key, Got DUMMY PRJ ID')
            instance.customvision_project_id = 'DUMMY-PROJECT-ID'

    @staticmethod
    def post_save(sender, instance, update_fields, **kwargs):
        if update_fields is not None: return
        print('[INFO] POST_SAVE')
        project_id = instance.id
        def _train_f(pid):
            requests.get('http://localhost:8000/api/projects/'+str(pid)+'/train')
        t = threading.Thread(target=_train_f, args=(project_id,))
        t.start()



    #@staticmethod
    #def m2m_changed(sender, instance, action, **kwargs):
    #    print('[INFO] M2M_CHANGED')
    #    project_id = instance.id
    #    #print(instance.parts)
    #    requests.get('http://localhost:8000/api/projects/'+str(project_id)+'/train')

pre_save.connect(Project.pre_save, Project, dispatch_uid='Project_pre')
post_save.connect(Project.post_save, Project, dispatch_uid='Project_post')
#m2m_changed.connect(Project.m2m_changed, Project.parts.through, dispatch_uid='Project_m2m')



# FIXME consider move this out of models.py
class Stream(object):
    def __init__(self, rtsp, part_id=None):
        if rtsp == '0': self.rtsp = 0
        elif rtsp == '1': self.rtsp = 1
        else: self.rtsp = rtsp
        self.part_id = part_id

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
        #b, img = self.cap.read()
        img = self.last_img.copy()
        #if b: return cv2.imencode('.jpg', img)[1].tobytes()
        #else : return None
        return cv2.imencode('.jpg', img)[1].tobytes()


    def close(self):
        self.status = 'stopped'
        print('[INFO] release', self)

import json
import datetime
import time
import threading
import queue
import random
import sys
import logging

from django.db import models
from django.db.models.signals import post_save, post_delete, pre_save, post_save, m2m_changed
import cv2
import requests

from azure.cognitiveservices.vision.customvision.training import CustomVisionTrainingClient
from azure.cognitiveservices.vision.customvision.training.models import ImageFileCreateEntry, Region
from azure.iot.device import IoTHubModuleClient


from azure.iot.device import IoTHubModuleClient
from vision_on_edge.settings import TRAINING_KEY, ENDPOINT
# trainer = CustomVisionTrainingClient(TRAINING_KEY, endpoint=ENDPOINT)

# is_trainer_valid = True

# Classification, General (compact) for classiciation
# try:
#     obj_detection_domain = next(domain for domain in trainer.get_domains(
#     ) if domain.type == "ObjectDetection" and domain.name == "General (compact)")
# except:
#     is_trainer_valid = False

try:
    iot = IoTHubRegistryManager(IOT_HUB_CONNECTION_STRING)
except:
    iot = None


def is_edge():
    try:
        IoTHubModuleClient.create_from_edge_environment()
        return True
    except:
        return False


logger = logging.getLogger(__name__)


def inference_module_url():
    if is_edge():
        return '172.18.0.1:5000'
    else:
        return 'localhost:5000'


# Create your models here.
class Trainer(models.Model):
    """
    Wrap up CustomVisionTraingClient.
    Try not to pass CustomVisionTraingClient object if new model is expected to be created.
    e.g. create project, create train/iteration
    Instead, create a wrapper methods and let call, in order to sync the db with remote.
    """
    trainer_name = models.CharField(
        max_length=100, blank=True, default='', unique=True)
    end_point = models.CharField(max_length=1000, blank=True, default='')
    training_key = models.CharField(max_length=1000, blank=True, default='')
    is_trainer_valid = models.BooleanField(default=False)
    obj_detection_domain_id = models.CharField(
        max_length=1000, blank=True, default='')

    class Meta:
        unique_together = ('end_point', 'training_key')

    @staticmethod
    def _get_trainer_obj_static(end_point: str, training_key: str):
        """
        If success, return the CustomVisionTrainingClient object. Return None otherwise
        """
        try:
            trainer = CustomVisionTrainingClient(
                training_key, endpoint=end_point)
            return trainer
        except:
            return None

    def _get_trainer_obj(self):
        """
        Use self.end_point and self.training_key to create trainer
        If success, return the CustomVisionTrainingClient object. Return None otherwise
        """
        return Trainer._get_trainer_obj_static(
            end_point=self.end_point, training_key=self.training_key)

    def revalidate(self):
        """
        Update self.is_trainer_valid
        """
        trainer = self._get_trainer_obj()
        try:
            obj_detection_domain = next(domain for domain in trainer.get_domains(
            ) if domain.type == "ObjectDetection" and domain.name == "General (compact)")
            self.is_trainer_valid = True
            self.obj_detection_domain_id = obj_detection_domain.id
            logger.info(
                "Successfully created trainer client and got obj detection domain")
        except:
            logger.exception(
                "Failed to create trainer client and get obj detection domain")
            self.is_trainer_valid = False
            self.obj_detection_domain_id = ''
        logger.info(
            f"{self.trainer_name} is_trainer_valid: {self.is_trainer_valid}")
        return self.is_trainer_valid

    def revalidate_and_get_trainer_obj(self):
        """
        Get trainer object and update self.is_trainer_valid.
        """
        self.revalidate()
        trainer = self._get_trainer_obj()
        return trainer

    @staticmethod
    def pre_save(sender, instance, update_fields, **kwargs):
        try:
            if update_fields is not None:
                return
            logger.debug('update_fields:', update_fields)
            if instance.id is not None:
                return
            logger.info('Creating Trainer on Custom Vision')
            logger.debug('Instance pre:', instance)

            trainer = Trainer._get_trainer_obj_static(
                training_key=instance.training_key,
                end_point=instance.end_point)
            obj_detection_domain = next(domain for domain in trainer.get_domains(
            ) if domain.type == "ObjectDetection" and domain.name == "General (compact)")
            instance.is_trainer_valid = True
            instance.obj_detection_domain_id = obj_detection_domain.id
        except:
            logger.exception("pre_save excetion")
            instance.is_trainer_valid = False
            instance.obj_detection_domain_id = ''

    def dequeue_iterations(self, custom_vision_project_id: str, max_iterations=2):
        """
        Dequeue training iterations
        """
        trainer = self.revalidate_and_get_trainer_obj()
        if not trainer:
            return
        iterations = trainer.get_iterations(custom_vision_project_id)
        if len(iterations) > max_iterations:
            # TODO delete train in Train Model
            trainer.delete_iteration(
                custom_vision_project_id, iterations[-1].as_dict()['id'])

    def create_project(self, project_name: str):
        """
        A wrapper function.
        Return project if succeed. Return None otherwise.
        """
        trainer = self.revalidate_and_get_trainer_obj()
        logger.info("Creating obj detection project")
        logger.info(f"trainer: {trainer}")
        if not trainer:
            logger.info("Trainer is invalid thus cannot create project")
            return None
        try:
            project = trainer.create_project(
                name=project_name,
                domain_id=self.obj_detection_domain_id)
            return project
        except:
            logger.exception(
                "Endpoint + Training_Key can create client but cannot create project")
            return None

    def __str__(self):
        return self.trainer_name


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
    area = models.CharField(max_length=1000, blank=True)

    def __str__(self):
        return self.name


class Image(models.Model):
    image = models.ImageField(upload_to='images/')
    part = models.ForeignKey(Part, on_delete=models.CASCADE)
    labels = models.CharField(max_length=1000, null=True)
    is_relabel = models.BooleanField(default=False)
    confidence = models.FloatField(default=0.0)
    uploaded = models.BooleanField(default=False)


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
    trainer = models.ForeignKey(
        Trainer, on_delete=models.CASCADE)
    camera = models.ForeignKey(Camera, on_delete=models.CASCADE)
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    parts = models.ManyToManyField(
        Part, related_name='part')
    customvision_project_id = models.CharField(max_length=200)
    customvision_project_name = models.CharField(max_length=200)
    download_uri = models.CharField(max_length=1000, null=True, blank=True)
    needRetraining = models.BooleanField(default=False)
    accuracyRangeMin = models.IntegerField(null=True)
    accuracyRangeMax = models.IntegerField(null=True)
    maxImages = models.IntegerField(null=True)
    deployed = models.BooleanField(default=False)

    @staticmethod
    def pre_save(sender, instance, update_fields, **kwargs):
        if update_fields is not None:
            return
        logger.info(f'update_fields: {update_fields}')
        if instance.id is not None:
            return

        name = 'VisionOnEdge-' + datetime.datetime.utcnow().isoformat()
        instance.customvision_project_name = name
        logger.info(f'instance pre: {instance}')

        trainer = instance.trainer
        instance.trainer.revalidate()
        instance.trainer.save()
        trainer = instance.trainer
        if trainer.is_trainer_valid:
            logger.info('Creating Project on Custom Vision')
            project = trainer.create_project(name)
            logger.info(f'Got Custom Vision Project ID {project.id}')
            instance.customvision_project_id = project.id
        else:
            logger.info('Has not set the key, Got DUMMY PRJ ID')
            instance.customvision_project_id = 'DUMMY-PROJECT-ID'

    @staticmethod
    def post_save(sender, instance, update_fields, **kwargs):
        logger.info(f'Saving instance: {instance} {update_fields}')
        if update_fields is not None:
            return
        logger.info('post_save')
        project_id = instance.id
        # def _train_f(pid):
        #     requests.get('http://localhost:8000/api/projects/'+str(pid)+'/train')
        # t = threading.Thread(target=_train_f, args=(project_id,))
        # t.start()

    # @staticmethod
    # def m2m_changed(sender, instance, action, **kwargs):
    #    print('[INFO] M2M_CHANGED')
    #    project_id = instance.id
    #    #print(instance.parts)
    #    requests.get('http://localhost:8000/api/projects/'+str(project_id)+'/train')


class Train(models.Model):
    status = models.CharField(max_length=200)
    log = models.CharField(max_length=1000)
    performance = models.CharField(max_length=1000, default='{}')
    project = models.ForeignKey(Project, on_delete=models.CASCADE)


pre_save.connect(Project.pre_save, Project, dispatch_uid='Project_pre')
post_save.connect(Project.post_save, Project, dispatch_uid='Project_post')
# m2m_changed.connect(Project.m2m_changed, Project.parts.through, dispatch_uid='Project_m2m')
pre_save.connect(Trainer.pre_save, Trainer, dispatch_uid='Trainer_pre')
# post_save.connect(Trainer.post_save, Trainer, dispatch_uid='Trainer_post')


# FIXME consider move this out of models.py
class Stream(object):
    def __init__(self, rtsp, part_id=None, inference=False):
        if rtsp == '0':
            self.rtsp = 0
        elif rtsp == '1':
            self.rtsp = 1
        else:
            self.rtsp = rtsp
        self.part_id = part_id

        self.last_active = time.time()
        self.status = 'init'
        self.last_img = None
        self.cur_img_index = 0
        self.last_get_img_index = 0
        self.id = id(self)

        self.mutex = threading.Lock()
        self.predictions = []
        self.inference = inference

        try:
            self.iot = IoTHubModuleClient.create_from_edge_environment()
        except:
            self.iot = None

        print('inference', self.inference)
        print('iot', self.iot)

        def _listener(self):
            if not self.inference:
                return
            while True:
                if self.last_active + 10 < time.time():
                    print('[INFO] stream finished')
                    break
                sys.stdout.flush()
                res = requests.get(
                    'http://'+inference_module_url()+'/prediction')

                self.mutex.acquire()
                self.predictions = res.json()
                self.mutex.release()
                time.sleep(0.02)
                # print('received p', self.predictions)

                # inference = self.iot.receive_message_on_input('inference', timeout=1)
                # if not inference:
                #    self.mutex.acquire()
                #    self.bboxes = []
                #    self.mutex.release()
                # else:
                #    data = json.loads(inference.data)
                #    print('receive inference', data)
                #    self.mutex.acquire()
                #    self.bboxes = [{
                #        'label': data['Label'],
                #        'confidence': data['Confidence'] + '%',
                #        'p1': (data['Position'][0], data['Position'][1]),
                #        'p2': (data['Position'][2], data['Position'][3])
                #    }]
                #    self.mutex.release()

        # if self.iot:
        threading.Thread(target=_listener, args=(self,)).start()

    def gen(self):
        self.status = 'running'
        print('[INFO] start streaming with', self.rtsp, flush=True)
        self.cap = cv2.VideoCapture(self.rtsp)
        while self.status == 'running':
            t, img = self.cap.read()
            # Need to add the video flag FIXME
            if t == False:
                print('[INFO] restart cam ...', flush=True)
                self.cap = cv2.VideoCapture(self.rtsp)
                time.sleep(1)
                continue

            img = cv2.resize(img, None, fx=0.5, fy=0.5)
            self.last_active = time.time()
            self.last_img = img.copy()
            self.cur_img_index = (self.cur_img_index + 1) % 10000
            self.mutex.acquire()
            predictions = list(prediction.copy()
                               for prediction in self.predictions)
            self.mutex.release()
            # print('bboxes', bboxes)
            # cv2.rectangle(img, bbox['p1'], bbox['p2'], (0, 0, 255), 3)
            # cv2.putText(img, bbox['label'] + ' ' + bbox['confidence'], (bbox['p1'][0], bbox['p1'][1]-15), cv2.FONT_HERSHEY_COMPLEX, 0.6, (0, 0, 255), 1)
            height, width = img.shape[0], img.shape[1]
            font = cv2.FONT_HERSHEY_SIMPLEX
            font_scale = 1
            thickness = 3
            for prediction in predictions:
                if prediction['probability'] > 0.25:
                    x1 = int(prediction['boundingBox']['left'] * width)
                    y1 = int(prediction['boundingBox']['top'] * height)
                    x2 = x1 + int(prediction['boundingBox']['width'] * width)
                    y2 = y1 + int(prediction['boundingBox']['height'] * height)
                    img = cv2.rectangle(
                        img, (x1, y1), (x2, y2), (0, 0, 255), 2)
                    img = cv2.putText(
                        img, prediction['tagName'], (x1+10, y1+30), font, font_scale, (0, 0, 255), thickness)
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + cv2.imencode('.jpg', img)[1].tobytes() + b'\r\n')
        self.cap.release()

    def get_frame(self):
        print('[INFO] get frame', self)
        # b, img = self.cap.read()
        time_begin = time.time()
        while True:
            if time.time() - time_begin > 5:
                break
            if self.last_get_img_index == self.cur_img_index:
                time.sleep(0.01)
            else:
                break
        self.last_get_img_index = self.cur_img_index
        img = self.last_img.copy()
        # if b: return cv2.imencode('.jpg', img)[1].tobytes()
        # else : return None
        return cv2.imencode('.jpg', img)[1].tobytes()

    def close(self):
        self.status = 'stopped'
        print('[INFO] release', self)

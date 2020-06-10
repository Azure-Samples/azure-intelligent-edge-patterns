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
from django.db.utils import IntegrityError

import cv2
import requests
from io import BytesIO
from PIL import Image as PILImage

from azure.cognitiveservices.vision.customvision.training import CustomVisionTrainingClient
from azure.cognitiveservices.vision.customvision.training.models import ImageFileCreateEntry, Region
from azure.cognitiveservices.vision.customvision.training.models.custom_vision_error_py3 import CustomVisionErrorException
from azure.iot.device import IoTHubModuleClient


from azure.iot.device import IoTHubModuleClient
from vision_on_edge.settings import TRAINING_KEY, ENDPOINT


try:
    iot = IoTHubRegistryManager(IOT_HUB_CONNECTION_STRING)
except:
    iot = None


def is_edge():
    try:
        IoTHubModuleClient.create_from_edge_environment()
        if len(Project.objects.filter(is_demo=False)) > 0:
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

class Part(models.Model):
    name = models.CharField(max_length=200)
    description = models.CharField(max_length=1000)
    is_demo = models.BooleanField(default=False)
    name_lower = models.CharField(max_length=200, default=str(name).lower())

    class Meta:
        unique_together = ('name_lower', 'is_demo')

    def __str__(self):
        return self.name

    @staticmethod
    def pre_save(sender, instance, update_fields, **kwargs):
        try:
            if update_fields is not None:
                return
            update_fields = []
            instance.name_lower = str(instance.name).lower()
            update_fields.append('name_lower')
        except IntegrityError as ie:
            logger.error(ie)
            raise ie
        except:
            logger.exception("Unexpected Error in Part Presave")


class Location(models.Model):
    name = models.CharField(max_length=200)
    description = models.CharField(max_length=1000)
    coordinates = models.CharField(max_length=200)
    is_demo = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class Image(models.Model):
    image = models.ImageField(upload_to='images/')
    part = models.ForeignKey(Part, on_delete=models.CASCADE)
    labels = models.CharField(max_length=1000, null=True)
    is_relabel = models.BooleanField(default=False)
    confidence = models.FloatField(default=0.0)
    uploaded = models.BooleanField(default=False)
    remote_url = models.CharField(max_length=1000, null=True)

    def get_remote_image(self):
        if self.remote_url:
            resp = requests.get(self.remote_url)
            if resp.status_code != requests.codes.ok:
                raise
            fp = BytesIO()
            fp.write(resp.content)
            file_name = f"{self.part.name}-{self.remote_url.split('/')[-1]}"
            logger.info(f"Saving as name {file_name}")
            from django.core import files

            self.image.save(file_name, files.File(fp))
            fp.close()
            self.save()
        else:
            raise

    def set_labels(self, left: float, top: float, width: float, height: float):
        try:
            if left > 1 or top > 1 or width > 1 or height > 1:
                raise ValueError(
                    f"{left}, {top}, {width}, {height} must be less than 1")
            elif left < 0 or top < 0 or width < 0 or height < 0:
                # raise ValueError(
                #    f"{left}, {top}, {width}, {height} must be greater than 0")
                logger.error(
                    f"{left}, {top}, {width}, {height} must be greater than 0")
                return
            elif (left + width) > 1 or (top + height) > 1:
                # raise ValueError(
                #    f"left + width:{left + width}, top + height:{top + height} must be less than 1")
                logger.error(
                    f"left + width:{left + width}, top + height:{top + height} must be less than 1")
                return

            with PILImage.open(self.image) as img:
                logger.info(f"Successfully open img {self.image}")
                size_width, size_height = img.size
                label_x1 = int(size_width*left)
                label_y1 = int(size_height*top)
                label_x2 = int(size_width*(left+width))
                label_y2 = int(size_height*(top+height))
                self.labels = json.dumps([{
                    'x1': label_x1,
                    'y1': label_y1,
                    'x2': label_x2,
                    'y2': label_y2}
                ])
                self.save()
                logger.info(f"Successfully save labels to {self.labels}")
        except ValueError:
            logger.exception("Set Annotation: Region Error")
        except:
            logger.exception("Unexpected Error")

    def add_labels(self, left: float, top: float, width: float, height: float):
        try:
            if left > 1 or top > 1 or width > 1 or height > 1:
                raise ValueError(
                    f"{left}, {top}, {width}, {height} must be less than 1")
            elif left < 0 or top < 0 or width < 0 or height < 0:
                raise ValueError(
                    f"{left}, {top}, {width}, {height} must be greater than 0")
            elif (left + width) > 1 or (top + height) > 1:
                raise ValueError(
                    f"left + width:{left + width}, top + height:{top + height} must be less than 1")
            pass
        except ValueError:
            logger.exception("Add Annotation: Region Error")
        except:
            logger.exception("Unexpected Error")


class Annotation(models.Model):
    image = models.OneToOneField(Image, on_delete=models.CASCADE)
    labels = models.CharField(max_length=1000, null=True)


class Setting(models.Model):
    """
    A wrapper model of CustomVisionTraingClient.
    Try not to pass CustomVisionTraingClient object if new model is expected to be created.
    e.g. create project, create train/iteration
    Instead, create a wrapper methods and let call, in order to sync the db with remote.
    """
    name = models.CharField(
        max_length=100, blank=True, default='', unique=True)
    endpoint = models.CharField(max_length=1000, blank=True)
    training_key = models.CharField(max_length=1000, blank=True)
    iot_hub_connection_string = models.CharField(max_length=1000, blank=True)
    device_id = models.CharField(max_length=1000, blank=True)
    module_id = models.CharField(max_length=1000, blank=True)

    is_collect_data = models.BooleanField(default=False)

    is_trainer_valid = models.BooleanField(default=False)
    obj_detection_domain_id = models.CharField(
        max_length=1000, blank=True, default='')

    class Meta:
        unique_together = ('endpoint', 'training_key')

    @staticmethod
    def _get_trainer_obj_static(endpoint: str, training_key: str):
        """
        return <CustomVisionTrainingClient>.
        : Success: return CustomVisionTrainingClient object
        """
        try:
            trainer = CustomVisionTrainingClient(
                api_key=training_key, endpoint=endpoint)
            return trainer
        except:
            logger.exception("Unexpected Error")
            return None

    def _get_trainer_obj(self):
        """
        return CustomVisionTrainingClient(self.training_key, self.endpoint)
        : Success: return the CustomVisionTrainingClient object
        """
        return Setting._get_trainer_obj_static(
            endpoint=self.endpoint, training_key=self.training_key)

    def _validate_static(endpoint: str, training_key: str):
        """
        return tuple (is_trainer_valid, trainer)
        """
        logger.info(f'validatiing {endpoint}, {training_key}')
        trainer = Setting._get_trainer_obj_static(
            endpoint=endpoint,
            training_key=training_key)
        is_trainer_valid = False
        try:
            trainer.get_domains()
            is_trainer_valid = True
        except:
            trainer = None
        finally:
            logger.info(
                f'is_trainer_valid: {is_trainer_valid}. trainer: {trainer}')
            return is_trainer_valid, trainer

    def revalidate(self):
        """
        Create a client, try to get obj_detection_domain, return is task success
        Update self.is_trainer_valid and return it's value
        Update obj_detection_domain_id to '' if failed
        : Success: True
        : Failed:  False
        """
        is_trainer_valid, trainer = Setting._validate_static(
            endpoint=self.endpoint,
            training_key=self.training_key)
        try:
            if is_trainer_valid:
                obj_detection_domain = next(domain for domain in trainer.get_domains(
                ) if domain.type == "ObjectDetection" and domain.name == "General (compact)")
                self.is_trainer_valid = True
                self.obj_detection_domain_id = obj_detection_domain.id
            else:
                self.is_trainer_valid = False
                self.obj_detection_domain_id = ''
        except:
            logger.exception('Setting.revalidate: Unexpected error')
        finally:
            self.save()
            return self.is_trainer_valid

    def revalidate_and_get_trainer_obj(self):
        """
        Update all the relevent fields and return the CustimVisionClient obj.
        : Success: return CustimVisionClient object
        : Failed:  return None
        """
        if self.revalidate():
            trainer = self._get_trainer_obj()
            return trainer
        else:
            return None

    @staticmethod
    def pre_save(sender, instance, update_fields, **kwargs):
        logger.info("Setting Presave")
        try:
            logger.info(f"instance.id: {instance.id}")
            logger.info(f"update fields: {update_fields}")

            if update_fields is not None:
                return
            logger.info(
                f'Validating Trainer {instance.name} (CustomVisionClient)')

            trainer = Setting._get_trainer_obj_static(
                training_key=instance.training_key,
                endpoint=instance.endpoint)
            obj_detection_domain = next(domain for domain in trainer.get_domains(
            ) if domain.type == "ObjectDetection" and domain.name == "General (compact)")

            logger.info(
                f'Validating Trainer {instance.name} (CustomVisionClient)... Pass')
            instance.is_trainer_valid = True
            instance.obj_detection_domain_id = obj_detection_domain.id
        except:
            logger.exception(
                "pre_save exception. Set is_trainer_valid to false and obj_detection_domain_id to ''")
            instance.is_trainer_valid = False
            instance.obj_detection_domain_id = ''
        finally:
            logger.info("Setting Presave... End")

    def create_project(self, project_name: str):
        """
        : Success: return project
        : Failed:  return None
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

    def delete_project(self, project_id: str):
        """
        : Success: return project
        : Failed:  return None
        """
        pass

    def __str__(self):
        return self.name


class Camera(models.Model):
    name = models.CharField(max_length=200)
    rtsp = models.CharField(max_length=1000)
    model_name = models.CharField(max_length=200)
    area = models.CharField(max_length=1000, blank=True)
    is_demo = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    @staticmethod
    def post_save(sender, instance, update_fields, **kwargs):
        if len(instance.area) > 1:
            logger.info('Sending new AOI to Inference Module...')
            requests.get('http://'+inference_module_url()+'/update_cam', params={
                         'cam_type': 'rtsp', 'cam_source': instance.rtsp, 'aoi': instance.area})


post_save.connect(Camera.post_save, Camera, dispatch_uid='Camera_post')


class Project(models.Model):
    setting = models.ForeignKey(
        Setting, on_delete=models.CASCADE, default=1)
    camera = models.ForeignKey(Camera, on_delete=models.CASCADE, null=True)
    location = models.ForeignKey(Location, on_delete=models.CASCADE, null=True)
    parts = models.ManyToManyField(
        Part, related_name='part')
    customvision_project_id = models.CharField(
        max_length=200, null=True, blank=True, default='')
    customvision_project_name = models.CharField(
        max_length=200, null=True, blank=True, default='')
    download_uri = models.CharField(
        max_length=1000, null=True, blank=True, default='')
    needRetraining = models.BooleanField(default=False)
    accuracyRangeMin = models.IntegerField(default=30)
    accuracyRangeMax = models.IntegerField(default=80)
    maxImages = models.IntegerField(default=10)
    deployed = models.BooleanField(default=False)
    train_try_counter = models.IntegerField(default=0)
    train_success_counter = models.IntegerField(default=0)
    is_demo = models.BooleanField(default=False)

    @staticmethod
    def pre_save(sender, instance, update_fields, **kwargs):
        logger.info("Project pre_save")
        logger.info(f'Saving instance: {instance} {update_fields}')

        if update_fields is not None:
            return
        # if instance.id is not None:
        #    return

        trainer = instance.setting.revalidate_and_get_trainer_obj()
        if instance.is_demo:
            logger.info(f"Project instance.is_demo: {instance.is_demo}")
            pass
        elif trainer and instance.customvision_project_id:
            # Endpoint and Training_key is valid, and trying to save with cv_project_id
            # Probably Syncing
            logger.info(
                f'Project CustomVision Project Id: {instance.customvision_project_id}')
            logger.info('Assume Syncing')
            try:
                cv_project_obj = trainer.get_project(
                    instance.customvision_project_id)
            except:
                logger.exception("Unexpected error")
        elif trainer:
            # Endpoint and Training_key is valid, and trying to save with no cv_project_id
            name = 'VisionOnEdge-' + datetime.datetime.utcnow().isoformat()
            instance.customvision_project_name = name

            logger.info('Creating Project on Custom Vision')
            project = instance.setting.create_project(name)
            logger.info(f'Got Custom Vision Project Id: {project.id}')
            instance.customvision_project_id = project.id
        else:
            logger.info('Has not set the key, Got DUMMY PRJ ID')
            instance.customvision_project_id = 'DUMMY-PROJECT-ID'
        logger.info("Project pre_save... End")

    @staticmethod
    def post_save(sender, instance, created, update_fields, **kwargs):
        logger.info("Project post_save")
        logger.info(f'Saving instance: {instance} {update_fields}')

        confidence_min = 30
        confidence_max = 80
        max_images = 10

        if instance.accuracyRangeMin is not None:
            confidence_min = instance.accuracyRangeMin

        if instance.accuracyRangeMax is not None:
            confidence_max = instance.accuracyRangeMax

        if instance.maxImages is not None:
            max_images = instance.maxImages

        def _r(confidence_min, confidence_max, max_images):
            requests.get('http://'+inference_module_url()+'/update_retrain_parameters', params={
                'confidence_min': confidence_min, 'confidence_max': confidence_max, 'max_imags': max_images})

        threading.Thread(target=_r, args=(
            confidence_min, confidence_max, max_images)).start()

        if update_fields is not None:
            return
        if not created:
            logger.info("Project modified")

        project_id = instance.id
        logger.info("Project post_save... End")
        # def _train_f(pid):
        #     requests.get('http://localhost:8000/api/projects/'+str(pid)+'/train')
        # t = threading.Thread(target=_train_f, args=(project_id,))
        # t.start()

    @staticmethod
    def pre_delete(sender, instance, using):
        pass

    def dequeue_iterations(self, max_iterations=2):
        """
        Dequeue training iterations
        """
        try:
            trainer = self.setting.revalidate_and_get_trainer_obj()
            if not trainer:
                return
            if not self.customvision_project_id:
                return
            iterations = trainer.get_iterations(self.customvision_project_id)
            if len(iterations) > max_iterations:
                # TODO delete train in Train Model
                trainer.delete_iteration(
                    self.customvision_project_id, iterations[-1].as_dict()['id'])
        except:
            logger.exception('dequeue_iteration error')
            return

    def upcreate_training_status(self, status: str, log: str, performance: str = '{}'):
        obj, created = Train.objects.update_or_create(
            project=self,
            defaults={
                'status': status,
                'log': log,
                'performance': performance}
        )
        return obj, created

    def train_project(self):
        """
        Train project self. Return is training request success (boolean)
        counter +=1
        : Success: return True
        : Failed : return False
        """
        is_task_success = False
        update_fields = []

        try:
            app_insight_on, app_insight_logger = get_app_insight_logger()
            self.train_try_counter += 1
            update_fields.append('train_try_counter')
            if app_insight_on:
                app_insight_logger.info(
                    f"Project: {self.customvision_project_name}. Train attempt count: {self.train_try_counter}")

            # Get CustomVisionClient
            trainer = self.setting.revalidate_and_get_trainer_obj()
            if not trainer:
                logger.error('Trainer is invalid. Not going to train...')
                raise

            # Submit training task
            logger.info(
                f"{self.customvision_project_name} submit training task to CustomVision")
            trainer.train_project(self.customvision_project_id)

            # Set trainer_counter
            self.train_success_counter += 1
            update_fields.append('train_success_counter')

            # Set deployed
            self.deployed = False
            update_fields.append('deployed')
            logger.info('set deployed = False')

            # If all above is success
            is_task_success = True
            return is_task_success
        except CustomVisionErrorException as e:
            if app_insight_on:
                app_insight_logger.exception(
                    f'From Custom Vision: {e.message}')
            else:
                logger.error(
                    f'From Custom Vision: {e.message}')
            self.save(update_fields=update_fields)
            raise e
        except:
            self.save(update_fields=update_fields)
            logger.exception('Something wrong while training project')
        finally:
            # App Insight
            if self.setting.is_collect_data:
                from cameras.utils.app_insight import part_monitor, img_monitor, training_job_triggered_monitor, retraining_jobs_monitor, get_app_insight_logger
                logger.info("Sending Logs to App Insight")
                part_monitor(len(Part.objects.filter(is_demo=False)))
                img_monitor(len(Image.objects.all()))
                training_job_triggered_monitor(self.train_try_counter)
                retraining_jobs_monitor(self.train_success_counter)
            self.save(update_fields=update_fields)

    def export_iterationv3_2(self, iteration_id):
        setting_obj = self.setting

        url = setting_obj.endpoint+'customvision/v3.2/training/projects/' + \
            self.customvision_project_id+'/iterations/'+iteration_id+'/export?platform=ONNX'
        res = requests.post(url, '{body}', headers={
                            'Training-key': setting_obj.training_key})

        return res
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


class Task(models.Model):
    task_type = models.CharField(max_length=100)
    status = models.CharField(max_length=200)
    log = models.CharField(max_length=1000)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)


pre_save.connect(Part.pre_save, Part, dispatch_uid='Part_pre')
pre_save.connect(Project.pre_save, Project, dispatch_uid='Project_pre')
post_save.connect(Project.post_save, Project, dispatch_uid='Project_post')
# m2m_changed.connect(Project.m2m_changed, Project.parts.through, dispatch_uid='Project_m2m')
pre_save.connect(Setting.pre_save, Setting, dispatch_uid='Setting_pre')


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
        logger.info(f'release {self}')

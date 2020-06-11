from __future__ import absolute_import, unicode_literals
import base64
import json
import time
import threading
import datetime
import threading
import traceback
import io
import sys
import logging

from django.shortcuts import render
from django.http import JsonResponse, HttpResponse, StreamingHttpResponse
from django.core.files.images import ImageFile
from django.core.exceptions import ObjectDoesNotExist
from django.db.utils import IntegrityError

# from rest_framework.views import APIView
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import serializers, viewsets
from rest_framework import status
from rest_framework import filters
from filters.mixins import FiltersMixin


import requests

from distutils.util import strtobool
from .models import Camera, Stream, Image, Location, Project, Part, Annotation, Setting, Train, Task
from vision_on_edge.settings import TRAINING_KEY, ENDPOINT, IOT_HUB_CONNECTION_STRING, DEVICE_ID, MODULE_ID
from configs.app_insight import APP_INSIGHT_INST_KEY


# FIXME move these to views
from azure.cognitiveservices.vision.customvision.training.models import ImageFileCreateEntry, Region, CustomVisionErrorException
from azure.iot.device import IoTHubModuleClient
#from azure.iot.hub import IoTHubRegistryManager
#from azure.iot.hub.models import Twin, TwinProperties
# try:
#    iot = IoTHubRegistryManager(IOT_HUB_CONNECTION_STRING)
# except:
#    iot = None


def is_edge():
    try:
        IoTHubModuleClient.create_from_edge_environment()
        return True
    except:
        return False


def inference_module_url():
    if is_edge():
        return '172.18.0.1:5000'
    else:
        return 'localhost:5000'


logger = logging.getLogger(__name__)


def update_train_status(project_id):
    def _train_status_worker(project_id):
        project_obj = Project.objects.get(pk=project_id)
        trainer = project_obj.setting.revalidate_and_get_trainer_obj()
        camera_id = project_obj.camera_id
        customvision_project_id = project_obj.customvision_project_id
        camera = Camera.objects.get(pk=camera_id)

        while True:
            time.sleep(1)

            iterations = trainer.get_iterations(customvision_project_id)
            if len(iterations) == 0:
                logger.info('Status: preparing custom vision environment')
                obj, created = project_obj.upcreate_training_status(
                    status='preparing',
                    log='Status : preparing custom vision environment'
                )
                continue
                # return JsonResponse({'status': 'waiting training'})

            iteration = iterations[0]
            if iteration.exportable == False or iteration.status != 'Completed':
                logger.info('Status: training')
                obj, created = project_obj.upcreate_training_status(
                    status='training',
                    log='Status : training model'
                )

                continue
                # return JsonResponse({'status': 'waiting training'})

            exports = trainer.get_exports(
                customvision_project_id, iteration.id)
            if len(exports) == 0 or not exports[0].download_uri:
                logger.info('Status: exporting model')
                obj, created = project_obj.upcreate_training_status(
                    status='exporting',
                    log='Status : exporting model'
                )
                # trainer.export_iteration(customvision_project_id, iteration.id, 'ONNX')
                res = project_obj.export_iterationv3_2(iteration.id)
                logger.info(res.json())
                continue
                # return JsonResponse({'status': 'exporting'})

            project_obj.download_uri = exports[0].download_uri
            project_obj.save(update_fields=['download_uri'])

            logger.info(f'Project is deployed before: {project_obj.deployed}')
            if not project_obj.deployed:
                if exports[0].download_uri:
                    # update_twin(iteration.id, exports[0].download_uri, camera.rtsp)
                    def _send(download_uri, rtsp):
                        # FIXME
                        # logger.info(f'update rtsp {rtsp}')
                        # logger.info(f'update model {download_uri}')
                        requests.get('http://'+inference_module_url()+'/update_cam',
                                     params={'cam_type': 'rtsp', 'cam_source': rtsp})
                        requests.get('http://'+inference_module_url() +
                                     '/update_model', params={'model_uri': download_uri})
                    threading.Thread(target=_send, args=(
                        exports[0].download_uri, camera.rtsp)).start()

                    project_obj.deployed = True
                    project_obj.save(
                        update_fields=['download_uri', 'deployed'])

                obj, created = project_obj.upcreate_training_status(
                    status='deploying',
                    log='Status : deploying model'
                )
                continue

            logger.info('Training Status: Completed')
            train_performance = []
            for iteration in iterations[:2]:
                train_performance.append(trainer.get_iteration_performance(
                    customvision_project_id, iteration.id).as_dict())

            logger.info(f'Training Performance: {train_performance}')
            obj, created = project_obj.upcreate_training_status(
                status='ok',
                log='Status : model training completed',
                performance=json.dumps(train_performance)
            )
            break
            # return JsonResponse({'status': 'ok', 'download_uri': exports[-1].download_uri})

    threading.Thread(target=_train_status_worker, args=(project_id,)).start()


@api_view()
def export(request, project_id):
    """get the status of train job sent to custom vision

       @FIXME (Hugh): change the naming of this endpoint
       @FIXME (Hugh): refactor how we store Train.performance
    """
    logger.info(f"exporting project. Project Id: {project_id}")
    project_obj = Project.objects.get(pk=project_id)
    train_obj = Train.objects.get(project_id=project_id)

    success_rate = 0.0
    inference_num = 0
    unidentified_num = 0
    try:
        res = requests.get('http://'+inference_module_url()+'/metrics')
        data = res.json()
        success_rate = int(data['success_rate']*100)/100
        inference_num = data['inference_num']
        unidentified_num = data['unidentified_num']
        logger.info(
            f"success_rate: {success_rate}. inference_num: {inference_num}")
    except requests.exceptions.ConnectionError:
        logger.error(
            f"Export failed. Inference module url: {inference_module_url()} unreachable")
    except:
        # TODO: return other json response if we can determine if inference is alive
        logger.exception("Unexpected error")
        # pass

    return JsonResponse({
        'status': train_obj.status,
        'log': train_obj.log,
        'download_uri': project_obj.download_uri,
        'success_rate': success_rate,
        'inference_num': inference_num,
        'unidentified_num': unidentified_num,
    })

# FIXME tmp workaround


@api_view()
def export_null(request):
    project_obj = Project.objects.all()[0]
    trainer = project_obj.setting.revalidate_and_get_trainer_obj()
    camera_id = project_obj.camera_id
    camera = Camera.objects.get(pk=camera_id)

    customvision_project_id = project_obj.customvision_project_id

    if trainer is None:
        logger.error('trainer obj is invalid')
        return JsonResponse({'status': 'trainer invalid'})
    iterations = trainer.get_iterations(customvision_project_id)
    if len(iterations) == 0:
        logger.info('not yet training ...')
        return JsonResponse({'status': 'waiting training'})

    iteration = iterations[0]

    if iteration.exportable == False or iteration.status != 'Completed':
        logger.info('waiting training ...')
        return JsonResponse({'status': 'waiting training'})

    exports = trainer.get_exports(customvision_project_id, iteration.id)
    if len(exports) == 0:
        logger.info('exporting ...')
        # trainer.export_iteration(customvision_project_id, iteration.id, 'ONNX')
        res = project_obj.export_iterationv3_2(iteration.id)
        logger.info(res.json())
        return JsonResponse({'status': 'exporting'})

    project_obj.download_uri = exports[0].download_uri
    project_obj.save(update_fields=['download_uri'])

    # if exports[0].download_uri != None and len(exports[0].download_uri) > 0:
    #update_twin(iteration.id, exports[0].download_uri, camera.rtsp)

    return JsonResponse({'status': 'ok', 'download_uri': exports[-1].download_uri})

#
# Part Views
#


class PartSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Part
        fields = ['id', 'name', 'description', 'is_demo']

    def create(self, validated_data):
        try:
            return Part.objects.create(**validated_data)
        except IntegrityError as ie:
            raise serializers.ValidationError(detail={
                'status': 'failed',
                'log': ie})
        except:
            logger.exception("Unexpected Error")
            raise serializers.ValidationError(detail={
                'status': 'failed',
                'log': "Unexpected Error"})

    def update(self, instance, validated_data):
        try:
            foo = super().update(instance, validated_data)
            return foo
        except IntegrityError as ie:
            logger.error("Exception")
            raise serializers.ValidationError(detail={
                'status': 'failed',
                'log': ie})
        except:
            logger.exception("Unexpected Error")
            raise serializers.ValidationError(detail={
                'status': 'failed',
                'log': "Unexpected Error"})


class PartViewSet(FiltersMixin, viewsets.ModelViewSet):
    queryset = Part.objects.all()
    serializer_class = PartSerializer
    filter_backends = (filters.OrderingFilter,)
    filter_mappings = {
        'is_demo': 'is_demo',
    }


#
# Location Views
#


class LocationSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'name', 'description', 'coordinates', 'is_demo']


class LocationViewSet(FiltersMixin, viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    filter_backends = (filters.OrderingFilter,)
    filter_mappings = {
        'is_demo': 'is_demo',
    }
#
# Camera Views
#


class CameraSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Camera
        fields = ['id', 'name', 'rtsp', 'area', 'is_demo']


class CameraViewSet(FiltersMixin, viewsets.ModelViewSet):
    queryset = Camera.objects.all()
    serializer_class = CameraSerializer
    filter_backends = (filters.OrderingFilter,)
    filter_mappings = {
        'is_demo': 'is_demo',
    }
#
# Task
#


class TaskSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Task
        fields = ['task_type', 'status', 'log', 'project']


class TaskViewSet(FiltersMixin, viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    filter_backends = (filters.OrderingFilter,)
    filter_mappings = {
        'project': 'project',
    }
#
#
# Settings Views
#


class SettingSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Setting
        fields = [
            'id',
            'name',
            'training_key',
            'endpoint',
            'iot_hub_connection_string',
            'device_id',
            'module_id',
            'is_trainer_valid',
            'is_collect_data',
            'obj_detection_domain_id']

    def create(self, validated_data):
        obj, created = Setting.objects.get_or_create(
            endpoint=validated_data['endpoint'],
            training_key=validated_data['training_key'],
            defaults={
                'name': validated_data['name'],
                'iot_hub_connection_string': validated_data['iot_hub_connection_string'],
                'device_id': validated_data['device_id'],
                'module_id': validated_data['module_id'],
                'is_collect_data': validated_data['is_collect_data']
            })
        return obj


class SettingViewSet(viewsets.ModelViewSet):
    queryset = Setting.objects.all()
    serializer_class = SettingSerializer

#
# Projects Views
#


class ProjectSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Project
        fields = [
            'setting',
            'id',
            'camera',
            'location',
            'parts',
            'download_uri',
            'customvision_project_id',
            'needRetraining',
            'accuracyRangeMin',
            'accuracyRangeMax',
            'maxImages'
        ]
        extra_kwargs = {
            'setting': {'required': False},
            'download_uri': {'required': False},
            'customvision_project_id': {'required': False}
        }

    def create(self, validated_data):
        logger.info("Project Serializer create")
        parts = validated_data.pop("parts")
        if 'setting' not in validated_data:
            validated_data['setting'] = Setting.objects.first()
        project = Project.objects.create(**validated_data)
        project.parts.set(parts)
        return project


class ProjectViewSet(FiltersMixin, viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    filter_backends = (filters.OrderingFilter,)
    filter_mappings = {
        'is_demo': 'is_demo',
    }
#
# Image Views
#


class ImageSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Image
        fields = ['id', 'image', 'labels', 'part', 'is_relabel', 'confidence']

#     def update(self, instance, validated_data):
#         # for attr in ['image', 'labels', 'part', 'is_relabel', 'confidence']:
#         #    print(attr)
#         instance.image = validated_data.get('image', instance.image)
#         instance.labels = validated_data.get('labels', instance.labels)
#         instance.part = validated_data.get('part', instance.part)
#         instance.is_relabel = validated_data.get(
#             'is_relabel', instance.is_relabel)
#         instance.uploaded = False
#         return instance


class ImageViewSet(viewsets.ModelViewSet):
    queryset = Image.objects.all()
    serializer_class = ImageSerializer


#
# Annotation Views
#
class AnnotationSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Annotation
        fields = ['id', 'image', 'labels']


class AnnotationViewSet(viewsets.ModelViewSet):
    queryset = Annotation.objects.all()
    serializer_class = AnnotationSerializer


#
# Train Views
#
class TrainSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Train
        fields = ['id', 'status', 'log', 'project']


class TrainViewSet(viewsets.ModelViewSet):
    queryset = Train.objects.all()
    serializer_class = TrainSerializer


#
# Stream Views
#
streams = []


@api_view()
def connect_stream(request):
    part_id = request.query_params.get('part_id')
    rtsp = request.query_params.get('rtsp') or '0'
    inference = (not not request.query_params.get('inference')) or False
    if part_id is None:
        return JsonResponse({'status': 'failed', 'reason': 'part_id is missing'})

    try:
        Part.objects.get(pk=int(part_id))
        s = Stream(rtsp, part_id=part_id, inference=inference)
        streams.append(s)
        return JsonResponse({'status': 'ok', 'stream_id': s.id})
    except ObjectDoesNotExist:
        return JsonResponse({'status': 'failed', 'reason': 'part_id doesnt exist'})


@api_view()
def disconnect_stream(request, stream_id):
    for i in range(len(streams)):
        stream = streams[i]
        if stream.id == stream_id:
            stream.close()
            return JsonResponse({'status': 'ok'})
    return JsonResponse({'status': 'failed', 'reason': 'cannot find stream_id '+str(stream_id)})


def video_feed(request, stream_id):
    for i in range(len(streams)):
        stream = streams[i]
        if stream.id == stream_id:
            return StreamingHttpResponse(stream.gen(), content_type='multipart/x-mixed-replace;boundary=frame')

    return HttpResponse('<h1>Unknown Stream '+str(stream_id)+' </h1>')


def capture(request, stream_id):
    for i in range(len(streams)):
        stream = streams[i]
        if stream.id == stream_id:
            img_data = stream.get_frame()
            img_io = io.BytesIO(img_data)
            img = ImageFile(img_io)
            img.name = datetime.datetime.utcnow().isoformat() + '.jpg'
            logger.info(stream)
            logger.info(stream.part_id)
            img_obj = Image(image=img, part_id=stream.part_id)
            img_obj.save()
            img_serialized = ImageSerializer(
                img_obj, context={'request': request})
            logger.info(img_serialized.data)

            return JsonResponse({'status': 'ok', 'image': img_serialized.data})

    return JsonResponse({'status': 'failed', 'reason': 'cannot find stream_id '+str(stream_id)})


@api_view()
def train_performance(request, project_id):
    project_obj = Project.objects.get(pk=project_id)
    trainer = project_obj.setting.revalidate_and_get_trainer_obj()
    customvision_project_id = project_obj.customvision_project_id

    if project_obj.is_demo:
        return JsonResponse({
            'status': 'ok',
            'precision': 1,
            'recall': 'demo_recall',
            'map': 'demo_map', })

    ret = {}
    iterations = trainer.get_iterations(customvision_project_id)

    def _parse(iteration):
        iteration = iteration.as_dict()
        status = iteration['status']
        if status == 'Completed':
            performance = trainer.get_iteration_performance(
                customvision_project_id, iteration['id']).as_dict()
            precision = performance['precision']
            recall = performance['recall']
            mAP = performance['average_precision']
        else:
            precision = 0.0
            recall = 0.0
            mAP = 0.0
        return {
            'status': status,
            'precision': precision,
            'recall': recall,
            'map': mAP,
        }

    if len(iterations) >= 1:
        ret['new'] = _parse(iterations[0])
    if len(iterations) >= 2:
        ret['previous'] = _parse(iterations[1])

    return JsonResponse(ret)


def _train(project_id):

    project_obj = Project.objects.get(pk=project_id)
    trainer = project_obj.setting.revalidate_and_get_trainer_obj()
    customvision_project_id = project_obj.customvision_project_id

    project_obj.upcreate_training_status(
        status='Status: preparing data (images and annotations)',
        log=''
    )

    project_obj.dequeue_iterations()

    try:
        if not trainer:
            raise ValueError('Please input valid training_key and namespace')
        count = 10
        while count > 0:
            part_ids = [part.id for part in project_obj.parts.all()]
            if len(part_ids) > 0:
                break
            logging.info('waiting parts...')
            time.sleep(1)
            count -= 1

        obj, created = project_obj.upcreate_training_status(
            status='sending',
            log='Status : sending data (images and annotations)')

        logger.info(f'Project id: {project_obj.id}')
        logger.info(f'Part ids: {part_ids}')
        tags = trainer.get_tags(customvision_project_id)

        tag_dict = {}
        tag_dict_local = {}
        project_partnames = {}
        project_changed = False
        for tag in tags:
            tag_dict[tag.name] = tag.id

        # Update existing tags
        # TODO: update tags
        # trainer.update_tags(project_id, tag_id, new_tag)

        # Create tags on CustomVisioin Project
        # Maybe move to Project Model?
        logger.info("Creating tags before training...")
        counter = 0
        for part_id in part_ids:
            part_name = Part.objects.get(id=part_id).name
            part_description = Part.objects.get(id=part_id).description
            project_partnames[part_name] = 'foo'
            if part_name not in tag_dict:
                logger.info(
                    f'Creating tag: {part_name}. Description: {part_description}')
                tag = trainer.create_tag(
                    project_id=customvision_project_id,
                    name=part_name,
                    description=part_description)
                tag_dict[tag.name] = tag.id
                counter += 1
        project_changed = project_changed or (counter > 0)
        logger.info(f"Created {counter} tags")
        logger.info("Creating tags... Done")

        # Delete tags on CustomVisioin Project
        # Maybe move to Project Model?
        logger.info("Deleting tags before training...")
        counter = 0
        for tag_name in tag_dict.keys():
            if tag_name not in project_partnames:
                counter += 1
                logger.info(
                    f"Deleting tag: {tag_name}, id: {tag_dict[tag_name]}")
                trainer.delete_tag(project_id=customvision_project_id,
                                   tag_id=tag_dict[tag_name])
        project_changed = project_changed or (counter > 0)
        logger.info(f"Deleted {counter} tags")
        logger.info("Deleting tags... Done")

        # Delete untagged images on CustomVisioin Project
        # Maybe move to Project Model?
        logger.info("Deleting untagged images before training...")
        untagged_image_count = trainer.get_untagged_image_count(
            project_id=customvision_project_id)
        batch_size = 50
        untagged_image_batch = trainer.get_untagged_images(
            project_id=customvision_project_id, take=batch_size)
        untagged_img_ids = []
        counter = 0
        expected_iteration = (untagged_image_count//batch_size)+1

        while(len(untagged_image_batch) > 0):
            logger.info(f"Deleting untagged images... batch {counter}")
            for img in untagged_image_batch:
                logger.info(f"Putting img: {img.id} to deleting list")
                untagged_img_ids.append(img.id)
            trainer.delete_images(
                project_id=customvision_project_id,
                image_ids=untagged_img_ids)
            untagged_image_batch = trainer.get_untagged_images(
                project_id=customvision_project_id,
                take=batch_size)
            untagged_img_ids = []
            counter += 1
            if counter > expected_iteration*10:
                logging.exception(
                    "Deleting untagged images... Take way too many iterations. Something went wrong.")
                break
        project_changed = project_changed or (counter > 0)
        logger.info("Deleting untagged images... Done")

        # Upload images to CustomVisioin Project
        # TODO: Replace the line below if we are sure local images sync Custom Vision well
        images = Image.objects.filter(
            part_id__in=part_ids,
            is_relabel=False,
            uploaded=False).all()
        logger.info('Uploading images before training...')
        #images = Image.objects.filter(part_id__in=part_ids).all()
        count = 0
        img_entries = []
        img_objs = []
        logger.info(f'Image length: {len(images)}')

        for index, image_obj in enumerate(images):
            logger.info(f'*** image {index+1}, {image_obj}')
            part = image_obj.part
            part_name = part.name
            tag_id = tag_dict[part_name]
            img_name = 'img-' + datetime.datetime.utcnow().isoformat()

            regions = []
            width = image_obj.image.width
            height = image_obj.image.height
            try:
                labels = json.loads(image_obj.labels)
                if len(labels) == 0:
                    continue
                for label in labels:
                    x = label['x1'] / width
                    y = label['y1'] / height
                    w = (label['x2'] - label['x1']) / width
                    h = (label['y2'] - label['y1']) / height
                    region = Region(tag_id=tag_id, left=x,
                                    top=y, width=w, height=h)
                    regions.append(region)

                image = image_obj.image
                image.open()
                img_entry = ImageFileCreateEntry(
                    name=img_name, contents=image.read(), regions=regions)
                img_objs.append(image_obj)
                img_entries.append(img_entry)
                project_changed = project_changed or (not image_obj.uploaded)
                if project_changed:
                    logger.info(f'project_changed: {project_changed}')
                count += 1
            except:
                logger.exception("unexpected error")

            if len(img_entries) >= 5:
                logger.info(f'Uploading {len(img_entries)} images')
                upload_result = trainer.create_images_from_files(
                    customvision_project_id, images=img_entries)
                logger.info(
                    f'Uploading images... Is batch success: {upload_result.is_batch_successful}')
                img_entries = []
                for img_obj in img_objs:
                    img_obj.uploaded = True
                    img_obj.save()
                img_objs = []

        if len(img_entries) >= 1:
            logger.info(f'Uploading {len(img_entries)} images')
            upload_result = trainer.create_images_from_files(
                customvision_project_id, images=img_entries)
            logger.info(
                f'Uploading images... Is batch success: {upload_result.is_batch_successful}')
            for img_obj in img_objs:
                img_obj.uploaded = True
                img_obj.save()
        logger.info('Uploading images... Done')

        try:
            if not project_changed:
                logger.info('Nothing changed. Not training')
                obj, created = project_obj.upcreate_training_status(
                    status='ok',
                    log='Status: Nothing changed. Not training')
            else:
                logger.info('Project changed. Training...')
                project_obj.train_project()

        except CustomVisionErrorException as e:
            logger.info(f'CustomVision Error: {e}')
            obj, created = project_obj.upcreate_training_status(
                status='failed',
                log=e.message)
            return JsonResponse({'status': 'failed',
                                 'log': e.message},
                                status=e.response.status_code)
        update_train_status(project_id)
        return JsonResponse({'status': 'ok'})

    except Exception as e:
        # TODO: Remove in production
        err_msg = traceback.format_exc()
        logger.exception(f'Exception: {err_msg}')
        obj, created = project_obj.upcreate_training_status(
            status='failed',
            log=f'Status : failed {str(err_msg)}')
        return JsonResponse({'status': 'failed', 'log': f'Status : failed {str(err_msg)}'})


@api_view()
def train(request, project_id):

    is_demo = request.query_params.get('demo')
    if is_demo and (is_demo.lower() == 'true'):
        logger.info('demo... bypass training process')

        requests.get('http://'+inference_module_url()+'/update_cam',
                     params={'cam_type': 'video', 'cam_source': 'sample_video/video_1min.mp4'})
        requests.get('http://'+inference_module_url() +
                     '/update_model', params={'model_dir': 'default_model_6parts'})

        project_obj = Project.objects.get(pk=project_id)
        parts = [p.name for p in project_obj.parts.all()]
        logger.info('Update parts f{parts}')
        requests.get('http://'+inference_module_url() +
                     '/update_parts', params={'parts': parts})

        obj, created = project_obj.upcreate_training_status(
            status='ok',
            log='Status : demo ok'
        )
        # FIXME pass the new model info to inference server (willy implement)
        return JsonResponse({'status': 'ok'})

    project_obj = Project.objects.get(pk=project_id)
    project_obj.upcreate_training_status(
        status='Status: preparing data (images and annotations)',
        log=''
    )
    logger.info('sleeping')

    rtsp = project_obj.camera.rtsp

    def _send(rtsp):
        logger.info(f'**** updaing cam to {rtsp}')
        requests.get('http://'+inference_module_url()+'/update_cam',
                     params={'cam_type': 'rtsp', 'cam_source': rtsp})
    threading.Thread(target=_send, args=(rtsp,)).start()
    return _train(project_id)


# FIXME will need to find a better way to deal with this
iteration_ids = set([])


def update_twin(iteration_id, download_uri, rtsp):

    if iot is None:
        return

    if iteration_id in iteration_ids:
        logger.info('This iteration already deployed on the Edge')
        return

    try:
        module = iot.get_module(DEVICE_ID, MODULE_ID)
    except:
        logger.error(
            f'Module does not exist. Device ID: {DEVICE_ID}, Module ID: {MODULE_ID}')
        return

    twin = Twin()
    twin.properties = TwinProperties(desired={
        'inference_files_zip_url': download_uri,
        'cam_type': 'rtsp_stream',
        'cam_source': rtsp
    })

    iot.update_module_twin(DEVICE_ID, MODULE_ID, twin, module.etag)

    logger.info(
        f'Updated IoT Module Twin with uri and rtsp. Download URI: {download_uri} RSTP: {rtsp}')

    iteration_ids.add(iteration_id)


@api_view(['POST'])
def upload_relabel_image(request):
    part_name = request.data['part_name']
    labels = request.data['labels']
    img_data = base64.b64decode(request.data['img'])
    confidence = request.data['confidence']
    is_relabel = request.data['is_relabel']

    parts = Part.objects.filter(name=part_name)
    if len(parts) == 0:
        logger.error(f'Unknown Part Name: {part_name}')
        return JsonResponse({'status': 'failed'})

    img_io = io.BytesIO(img_data)

    img = ImageFile(img_io)
    img.name = datetime.datetime.utcnow().isoformat() + '.jpg'
    img_obj = Image(
        image=img, part_id=parts[0].id, labels=labels, confidence=confidence, is_relabel=True)
    img_obj.save()

    return JsonResponse({'status': 'ok'})


@api_view(['POST'])
def relabel_update(request):

    logger.info('update relabeling')
    data = request.data
    if type(data) is not type([]):
        logger.info('data should be array of object {}')
        return JsonResponse({'status': 'failed'})

    for item in data:
        image_id = item['imageId']
        part_id = item['partId']
        img_obj = Image.objects.get(pk=image_id)
        if part_id is not None:
            img_obj.is_relabel = False
            img_obj.part_id = part_id
            img_obj.save()
            logger.info(
                f'image {image_id} with part {part_id} added from relabeling pool')
        else:
            img_obj.delete()
            logger.info(f'image {image_id} removed from relabeling pool')

    return JsonResponse({'status': 'ok'})


@api_view()
def inference_video_feed(request, project_id):
    return JsonResponse({'status': 'ok', 'url': 'http://'+inference_module_url()+'/video_feed?inference=1'})


@api_view()
def instrumentation_key(request):
    return JsonResponse({'status': 'ok', 'key': APP_INSIGHT_INST_KEY})


@api_view()
def list_projects(request, setting_id):
    """
    Get the list of project at Custom Vision.
    """
    setting_obj = Setting.objects.get(pk=setting_id)
    trainer = setting_obj.revalidate_and_get_trainer_obj()

    rs = {}
    project_list = trainer.get_projects()
    for project in project_list:
        rs[project.id] = project.name

    return JsonResponse(rs)


@api_view()
def pull_cv_project(request, project_id):
    """
    Delete the local project, parts and images. Pull the remote project from Custom Vision.
    TODO: open a thread
    """
    logger.info("Pulling CustomVision Project")
    update_fields = []
    # FIXME: Should send correct id
    # project_obj = Project.objects.get(pk=project_id)
    if len(Project.objects.filter(is_demo=False)):
        project_obj = Project.objects.filter(is_demo=False)[0]
    # Check Project
    if project_obj.is_demo:
        return JsonResponse({
            'status': 'failed',
            'logs': 'Demo project should not change'
        })
    # Check Training_Key, Endpoint
    trainer = project_obj.setting.revalidate_and_get_trainer_obj()
    if not trainer:
        return JsonResponse({
            'status': 'failed',
            'logs': '(Endpoint, Training_key) invalid'
        })

    # Check Customvision Project id
    customvision_project_id = request.query_params.get(
        'customvision_project_id')
    logger.info(f"customvision_project_id: {customvision_project_id}")

    # Check Partial
    try:
        is_partial = bool(strtobool(request.query_params.get('partial')))
    except:
        is_partial = True
    logger.info(f"Loading Project in Partial Mode: {is_partial}")

    try:
        # Invalid CustomVision Project ID handled by exception
        project = trainer.get_project(project_id=customvision_project_id)
        project_obj.customvision_project_id = customvision_project_id
        project_obj.deployed = False
        update_fields.extend(['customvision_project_id', 'deployed'])

        logger.info("Deleting all parts and images...")
        Part.objects.filter(is_demo=False).delete()
        Image.objects.all().delete()

        logger.info("Pulling Parts...")
        counter = 0
        tags = trainer.get_tags(customvision_project_id)
        for tag in tags:
            logger.info(
                f"Creating Part {counter}: {tag.name} {tag.description}")
            part_obj, created = Part.objects.update_or_create(
                name=tag.name,
                description=tag.description if tag.description else f"{tag.name}'s description"
            )
            counter += 1
            if created:
                project_obj.parts.add(part_obj)
            else:
                logging.error(f"{tag.name} not added")
        logger.info(f"Pulled {counter} Parts")
        logger.info("Pulling Parts... End")

        # Partial
        if is_partial:
            exporting_task_obj = Task.objects.create(
                task_type='export_iteration', status='init', log='Just Started', project=project_obj)
            exporting_task_obj.start_exporting()
            return JsonResponse({'status': 'ok', 'task.id': exporting_task_obj.id})

        # Full Download
        logger.info("Pulling Tagged Images...")
        img_counter = 0
        imgs_count = trainer.get_tagged_image_count(
            project_id=customvision_project_id)
        img_batch_size = 50
        img_index = 0

        while (img_index <= imgs_count):
            logger.info(f'Img Index: {img_index}. Img Count: {imgs_count}')
            imgs = trainer.get_tagged_images(
                project_id=customvision_project_id,
                take=img_batch_size,
                skip=img_index)
            for img in imgs:
                logger.info(f"*** img {img_counter}")
                for region in img.regions:
                    part_obj = Part.objects.filter(
                        name=region.tag_name, is_demo=False)[0]
                    img_obj, created = Image.objects.update_or_create(
                        part=part_obj,
                        remote_url=img.original_image_uri
                    )
                    if created:
                        logger.info(f"Downloading img {img.id}")
                        img_obj.get_remote_image()
                        logger.info(f"Setting label of {img.id}")
                        img_obj.set_labels(
                            left=region.left,
                            top=region.top,
                            width=region.width,
                            height=region.height)
                        img_counter += 1
                    else:
                        # TODO:  Multiple region with same tag
                        logger.info(f"Adding label to {img.id}")
                        img_obj.add_labels(
                            left=region.left,
                            top=region.top,
                            width=region.width,
                            height=region.height)

            img_index += img_batch_size

        logger.info(f"Pulled {counter} images")
        logger.info("Pulling Tagged Images... End")
        logger.info("Pulling CustomVision Project... End")
        return JsonResponse({'status': 'ok'})
    except CustomVisionErrorException as e:
        logger.error(f"CustomVisionErrorException: {e.message}")
        return JsonResponse({'status': 'failed',
                             'log': e.message})
    except Exception as e:
        # TODO: Remove in production
        err_msg = traceback.format_exc()
        logger.exception(f'Exception: {err_msg}')
        return JsonResponse({
            'status': 'failed',
            'log': f'Status : failed {str(err_msg)}'})
    finally:
        project_obj.save(update_fields=update_fields)


@api_view()
def reset_project(request, project_id):
    try:
        project_obj = Project.objects.get(pk=project_id)
    except:
        if len(Project.objects.filter(is_demo=False)):
            project_obj = Project.objects.filter(is_demo=False)[0]
    Part.objects.filter(is_demo=False).delete()
    Image.objects.all().delete()
    project_obj.customvision_project_id = ''
    project_obj.customvision_project_name = ''
    project_obj.download_uri = ''
    project_obj.needRetraining = False
    project_obj.accuracyRangeMin = 30
    project_obj.accuracyRangeMax = 80
    project_obj.maxImages = 10
    project_obj.deployed = False
    project_obj.train_try_counter = 0
    project_obj.train_success_counter = 0
    project_obj.save()
    return JsonResponse({'status': 'ok'})

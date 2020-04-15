import json
import time
import datetime
import io

from django.shortcuts import render
from django.http import JsonResponse, HttpResponse, StreamingHttpResponse
from django.core.files.images import ImageFile
from django.core.exceptions import ObjectDoesNotExist

#from rest_framework.views import APIView
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import serializers, viewsets
from rest_framework import status

from .models import Camera, Stream, Image, Location, Project, Part, Annotation

# FIXME move these to views
from azure.cognitiveservices.vision.customvision.training import CustomVisionTrainingClient
from azure.cognitiveservices.vision.customvision.training.models import ImageFileCreateEntry, Region

from vision_on_edge.settings import TRAINING_KEY, ENDPOINT
trainer = CustomVisionTrainingClient(TRAINING_KEY, endpoint=ENDPOINT)

is_trainer_valid = True

try:
    obj_detection_domain = next(domain for domain in trainer.get_domains() if domain.type == "ObjectDetection" and domain.name == "General")
except:
    is_trainer_valid = False
# FIXME


import cv2

#
# Part Views
#
class PartSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Part
        fields = ['id', 'name']

class PartViewSet(viewsets.ModelViewSet):
    queryset = Part.objects.all()
    serializer_class = PartSerializer

#
# Location Views
#
class LocationSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'name', 'description', 'coordinates']

class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
#
# Camera Views
#

class CameraSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Camera
        fields = ['id', 'name', 'rtsp']

class CameraViewSet(viewsets.ModelViewSet):
    queryset = Camera.objects.all()
    serializer_class = CameraSerializer

#
# Projects Views
#
class ProjectSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'location', 'parts']

class ProjectSerializer2(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'location', 'parts']

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

#
# Image Views
#
class ImageSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Image
        fields = ['id', 'image', 'labels']

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
# Stream Views
#
streams = []
@api_view()
def connect_stream(request):
    part_id = request.query_params.get('part_id')
    rtsp = request.query_params.get('rtsp') or '0'
    if part_id is None:
        return JsonResponse({'status': 'failed', 'reason': 'part_id is missing'})

    try:
        Part.objects.get(pk=int(part_id))
        s = Stream(rtsp, part_id=part_id)
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
            print(stream)
            print(stream.part_id)
            img_obj = Image(image=img, part_id=stream.part_id)
            img_obj.save()
            img_serialized = ImageSerializer(img_obj, context={'request': request})

            return JsonResponse({'status': 'ok', 'image': img_serialized.data})

    return JsonResponse({'status': 'failed', 'reason': 'cannot find stream_id '+str(stream_id)})

@api_view()
def train(request, project_id):
    project_obj = Project.objects.get(pk=project_id)
    customvision_project_id = project_obj.customvision_project_id

    images = Image.objects.all()
    img_entries = []

    tags = trainer.get_tags(customvision_project_id)
    tag_dict = {}
    for tag in tags:
        tag_dict[tag.name] = tag.id

    for image_obj in images:
        print('*** image', image_obj)

        part = image_obj.part
        part_name = part.name
        if part_name not in tag_dict:
            print('part_name', part_name)
            tag = trainer.create_tag(customvision_project_id, part_name)
            tag_dict[tag.name] = tag.id

        tag_id = tag_dict[part_name]

        name = 'img-' + datetime.datetime.utcnow().isoformat()
        regions = []
        try:
            print(0)
            annotation = image_obj.annotation
            print(1)
            print(annotation)
            print(annotation.labels)
            labels = json.loads(annotation.labels)
            print(2)
            for label in labels:
                x = label['x1'] / 1280
                y = label['y1'] / 720
                w = (label['x2'] - label['x1']) / 1280
                h = (label['y2'] - label['y1']) / 720
                region = Region(tag_id=tag_id, left=x, top=y, width=w, height=h)
                print(region)
                regions.append(region)
            print(3)

            image = image_obj.image
            image.open()
            img_entry = ImageFileCreateEntry(name=name, contents=image.read(), regions=regions)
            img_entries.append(img_entry)
        except:
            pass
    print('uploading...')
    upload_result = trainer.create_images_from_files(customvision_project_id, images=img_entries)
    print(upload_result)

    return JsonResponse({'status': 'ok'})


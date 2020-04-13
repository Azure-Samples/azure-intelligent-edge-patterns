import time
import datetime
import io

from django.shortcuts import render
from django.http import JsonResponse, HttpResponse, StreamingHttpResponse
from django.core.files.images import ImageFile
from django.core.exceptions import ObjectDoesNotExist

#from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework import serializers, viewsets

from .models import Camera, Stream, Image, Location, Project, Part

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
# Stream Views
#
streams = []
@api_view()
def connect_stream(request):
    part_id = request.query_params.get('part_id')
    if part_id is None:
        return JsonResponse({'status': 'failed', 'reason': 'part_id is missing'})

    try:
        Part.objects.get(pk=int(part_id))
        s = Stream(0, part_id=part_id)
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

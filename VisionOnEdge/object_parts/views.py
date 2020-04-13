from django.shortcuts import render

from rest_framework import serializers, viewsets

from .models import Part

# Create your views here.

class PartSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Part
        fields = ['id', 'name']

class PartViewSet(viewsets.ModelViewSet):
    queryset = Part.objects.all()
    serializer_class = PartSerializer



from rest_framework import serializers
from .models import Trainer


class TrainerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trainer
        fields = ['id',
                  'trainer_name',
                  'end_point',
                  'training_key',
                  'is_trainer_valid',
                  'obj_detection_domain_id']

    def create(self, validated_data):
        trainer, created = Trainer.objects.get_or_create(
            end_point=validated_data['end_point'],
            training_key=validated_data['training_key'],
            defaults={
                'trainer_name': validated_data['trainer_name']
            })
        return trainer

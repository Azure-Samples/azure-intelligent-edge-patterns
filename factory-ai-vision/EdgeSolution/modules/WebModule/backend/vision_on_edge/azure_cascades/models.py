from django.db import models

# Create your models here.
class Cascade(models.Model):
    name = models.CharField(max_length=200, null=True, blank=True, default="")
    flow = models.CharField(max_length=5000, null=True, blank=True, default="")
    raw_data = models.CharField(max_length=5000, null=True, blank=True, default="")
    prediction_uri = models.CharField(
        max_length=1000, null=True, blank=True, default=""
    )

    def __repr__(self):
        return self.name.__repr__()

    def __str__(self):
        return self.name.__str__()

    def get_prediction_uri(self):
        """get_prediction_uri"""
        return self.prediction_uri
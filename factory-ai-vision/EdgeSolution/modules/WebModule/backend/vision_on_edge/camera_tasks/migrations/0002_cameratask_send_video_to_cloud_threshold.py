# Generated by Django 3.0.8 on 2020-10-28 05:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("camera_tasks", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="cameratask",
            name="send_video_to_cloud_threshold",
            field=models.IntegerField(default=60),
        ),
    ]
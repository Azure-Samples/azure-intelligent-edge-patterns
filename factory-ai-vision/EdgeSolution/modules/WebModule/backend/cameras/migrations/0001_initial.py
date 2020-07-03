# Generated by Django 3.0.7 on 2020-07-03 11:37

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('locations', '0001_initial'),
        ('azure_settings', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Camera',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('rtsp', models.CharField(max_length=1000)),
                ('area', models.CharField(blank=True, max_length=1000)),
                ('is_demo', models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name='Part',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('description', models.CharField(blank=True, default='', max_length=1000)),
                ('is_demo', models.BooleanField(default=False)),
                ('name_lower', models.CharField(default='<django.db.models.fields.charfield>', max_length=200)),
            ],
            options={
                'unique_together': {('name_lower', 'is_demo')},
            },
        ),
        migrations.CreateModel(
            name='Project',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('customvision_project_id', models.CharField(blank=True, default='', max_length=200, null=True)),
                ('customvision_project_name', models.CharField(blank=True, default='', max_length=200, null=True)),
                ('download_uri', models.CharField(blank=True, default='', max_length=1000, null=True)),
                ('needRetraining', models.BooleanField(default=True)),
                ('accuracyRangeMin', models.IntegerField(default=30)),
                ('accuracyRangeMax', models.IntegerField(default=80)),
                ('maxImages', models.IntegerField(default=20)),
                ('deployed', models.BooleanField(default=False)),
                ('training_counter', models.IntegerField(default=0)),
                ('retraining_counter', models.IntegerField(default=0)),
                ('is_demo', models.BooleanField(default=False)),
                ('metrics_is_send_iothub', models.BooleanField(default=False)),
                ('metrics_accuracy_threshold', models.IntegerField(default=50)),
                ('metrics_frame_per_minutes', models.IntegerField(default=6)),
                ('prob_threshold', models.IntegerField(default=10)),
                ('camera', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='cameras.Camera')),
                ('location', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='locations.Location')),
                ('parts', models.ManyToManyField(related_name='part', to='cameras.Part')),
                ('setting', models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='azure_settings.Setting')),
            ],
        ),
        migrations.CreateModel(
            name='Train',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(max_length=200)),
                ('log', models.CharField(max_length=1000)),
                ('performance', models.CharField(default='{}', max_length=1000)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='cameras.Project')),
            ],
        ),
        migrations.CreateModel(
            name='Task',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('task_type', models.CharField(max_length=100)),
                ('status', models.CharField(max_length=200)),
                ('log', models.CharField(max_length=1000)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='cameras.Project')),
            ],
        ),
        migrations.CreateModel(
            name='Image',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', models.ImageField(upload_to='images/')),
                ('labels', models.CharField(max_length=1000, null=True)),
                ('is_relabel', models.BooleanField(default=False)),
                ('confidence', models.FloatField(default=0.0)),
                ('uploaded', models.BooleanField(default=False)),
                ('remote_url', models.CharField(max_length=1000, null=True)),
                ('part', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='cameras.Part')),
            ],
        ),
        migrations.CreateModel(
            name='Annotation',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('labels', models.CharField(max_length=1000, null=True)),
                ('image', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='cameras.Image')),
            ],
        ),
    ]

# -*- coding: utf-8 -*-
"""App constants
"""

PROGRESS_1_FINDING_PROJECT: dict = {
    'status': 'finding project',
    'log': 'Finding Project on Custom Vision.'
}
PROGRESS_2_PROJECT_FOUND: dict = {
    'status': 'uploading project',
    'log': 'Project found on Custom Vision.'
}
PROGRESS_2_PROJECT_CREATED: dict = {
    'status': 'uploading project',
    'log': 'Creating project on Custom Vision.'
}

PROGRESS_3_UPLOADING_PARTS: dict = {
    'status': 'uploading parts',
    'log': 'Uploading parts to Custom Vision.'
}
PROGRESS_4_UPLOADING_IMAGES: dict = {
    'status': 'uploading images',
    'log': 'Uploading images to Custom Vision.'
}
PROGRESS_5_SUBMITTING_TRAINING_TASK: dict = {
    'status': 'preparing training task',
    'log': 'Submitting training task to Custom Vision.'
}
PROGRESS_6_PREPARING_CUSTOM_VISION_ENV: dict = {
    'status': 'preparing custom vision environment',
    'log': 'Preparing Custom Vision Environment.'
}
PROGRESS_7_TRAINING: dict = {
    'status': 'training',
    'log': 'Training on Custom Vision (may take 10-15 minutes).'
}
PROGRESS_8_EXPORTING: dict = {
    'status': 'exporting',  #Change line
    'log': 'Exporting model.'
}
PROGRESS_9_DEPLOYING: dict = {
    'status': 'deploying',
    'log': 'Deploying model to inference module.'
}

# Complete
PROGRESS_0_OK: dict = {'status': 'ok', 'log': 'Model trained and deployed'}

# Failed

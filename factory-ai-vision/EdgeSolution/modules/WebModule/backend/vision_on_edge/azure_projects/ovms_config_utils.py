import os
import glob
import json
import configparser

face_detection_config = {
    "model_config_list": [{
        "config": {
            "name": "face_detection",
            "base_path": "/workspace/face-detection-retail-0004/",
            "shape": "(1,3,400,600)",
            "layout": "NHWC"
        }
    }]
}

age_gender_recognition_config = {
    "model_config_list": [
        {
            "config": {
                "name": "age_gender_recognition",
                "base_path": "/workspace/age-gender-recognition-retail-0013/",
                "shape": "(1,3,64,64)",
                "layout": "NHWC"
            }
        },
    ]
}

emotion_recognition_config = {
    "model_config_list": [{
        "config": {
            "name": "emotion_recognition",
            "base_path": "/workspace/emotion-recognition-retail-0003/",
            "shape": "(1,3,64,64)",
            "layout": "NHWC"
        }
    }]
}


def create_config(model_name):
    config_file = "/workspace/config.json"
    config = {}

    if model_name == "face_detection":
        config = face_detection_config
    elif model_name == "ge_gender_recognition":
        config = age_gender_recognition_config
    elif model_name == "emotion_recognition":
        config = emotion_recognition_config
    else:
        return config

    configObj = json.dumps(config)
    with open(config_file, 'w') as f:
        f.write(configObj)

    return config


def read_classes(classes_path):
    with open(classes_path) as f:
        class_names = f.readlines()
    class_names = [c.strip() for c in class_names]
    return class_names


def get_model_info():
    parser = configparser.ConfigParser()

    model_path = '/workspace'
    model_list = []
    model_infos = {}
    for model in os.listdir(model_path):
        model_name = ' '.join(c.capitalize() for c in model.split('-'))

        if glob.glob('{}/{}/1/*.xml'.format(model_path, model)):
            cur_path = '{}/{}/1/'.format(model_path, model)
            model_type_file = glob.glob('{}/config.ini'.format(cur_path))
            parser.read(model_type_file)
            model_type = parser['model']['type']
            model_id = parser['model']['id']
            description_title = parser['description']['title']
            description_content = parser['description']['content']
            description_image_url = parser['description']['imageURL']
            inputs_content = parser['inputs']['content']
            inputs_layout = parser['inputs']['layout']
            outputs_content = parser['outputs']['content']

            class_file = glob.glob(model + '/1/classes.*')
            if class_file:
                classes = read_classes(class_file[0])
            else:
                classes = []

            model_infos = {
                'model_name': model_name,
                'model_type': model_type,
                'model_id': model_id,
                'classes': classes,
                'description_title': description_title,
                'description_content': description_content,
                'description_image_url': description_image_url,
                'inputs_content': inputs_content,
                'inputs_layout': inputs_layout,
                'outputs_content': outputs_content
            }
        else:
            continue

        model_list.append(model_infos)

    return model_list

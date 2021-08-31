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
    }],
    "cascade_config_list": {
        "openvino_model_name": "face-detection-retail-0004",
        "inputs": [{
            "name": "data",
            "metadata": {
                "type": "image",    
                "shape": [1, 3, 416, 416],
                "layout": ["N", "H", "W", "C"],
                "color_format": "BGR",
            }
        }],
        "outputs": [{
            "name": "detection_out",
            "metadata": {
                "type": "bounding_box",
                "shape": [1, 1, 200, 7],
                "layout": [1, 1, "B", "F"],
                "labels": ["person"],
            }
        }]
    }
}

emotion_recognition_config = {
    "model_config_list": [{
        "config": {
            "name": "emotion_recognition",
            "base_path": "/workspace/emotion-recognition-retail-0003/",
            "shape": "(1,3,64,64)",
            "layout": "NHWC"
        }
    }],
    "cascade_config_list": {
        "openvino_model_name": "emotions-recognition-retail-0003",
        "inputs": [{
            "name": "data",
            "metadata": {
                "type": "image",
                "shape": [1, 3, 64, 64],
                "layout": ["N", "H", "W", "C"],
            }
        }],
        "outputs": [{
            "name": "prob_emotion",
            "metadata": {
                "type": "classification",
                "shape": [1, 5, 1, 1],
                "layout": [1, "C", 1, 1],
                "labels": ["neutral", "happy", "sad", "surprise", "anger"],
            }
        }]
    }
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
    ],
    "cascade_config_list": {
        "openvino_model_name": "age-gender-recognition-retail-0013",
        "inputs": [{
            "name": "data",
            "metadata": {
                "type": "image",
                "shape": [1, 3, 64, 64],
                "layout": ["N", "H", "W", "C"],
            }
        }],
        "outputs": [
            {
                "name": "age_conv3",
                "metadata": {
                    "type": "regression",
                    "shape": [1, 1, 1, 1],
                    "layout": [1, 1, 1, 1],
                    "scale": 100,
                }
            },
            {
                "name": "prob",
                "metadata": {
                    "type": "classfication",
                    "shape": [1, 2, 1, 1],
                    "layout": [1, "P", 1, 1],
                    "labels": ["female", "male"],
                }
            }
        ]
    }
}


def create_config(model_name):
    config_file = "/workspace/config.json"
    config = {}

    if model_name == "face_detection":
        model_config_list = face_detection_config['model_config_list']
        cascade_config_list = face_detection_config['cascade_config_list']
    elif model_name == "age_gender_recognition":
        model_config_list = age_gender_recognition_config['model_config_list']
        cascade_config_list = age_gender_recognition_config['cascade_config_list']
    elif model_name == "emotion_recognition":
        model_config_list = emotion_recognition_config['model_config_list']
        cascade_config_list = emotion_recognition_config['cascade_config_list']
    else:
        return config
    
    config['model_config_list'] = model_config_list

    configObj = json.dumps(config)
    with open(config_file, 'w') as f:
        f.write(configObj)

    return cascade_config_list


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
            if model_type_file:
                parser.read(model_type_file)
                model_type = parser['model']['type']
                model_id = parser['model']['id']
                description_title = parser['description']['title']
                description_content = parser['description']['content']
                description_image_url = parser['description']['imageURL']
                inputs_content = parser['inputs']['content']
                inputs_layout = parser['inputs']['layout']
                outputs_content = parser['outputs']['content']

                class_file = glob.glob('{}/classes.*'.format(cur_path))
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
        else:
            continue

        model_list.append(model_infos)

    return model_list

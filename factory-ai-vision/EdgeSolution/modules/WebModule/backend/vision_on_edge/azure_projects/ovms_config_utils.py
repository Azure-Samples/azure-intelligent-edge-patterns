import json


face_detection_config = {
    "model_config_list": [
        {
            "config": {
                "name": "face_detection",
                "base_path": "/workspace/face-detection-retail-0004/",
                "shape": "(1,3,400,600)",
                "layout": "NHWC"
            }
        }
    ]
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
    "model_config_list": [
        {
            "config": {
                "name": "emotion_recognition",
                "base_path": "/workspace/emotion-recognition-retail-0003/",
                "shape": "(1,3,64,64)",
                "layout": "NHWC"
            }
        }
    ]
}


def create_config(model_name):
    config_file = "config.json"
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

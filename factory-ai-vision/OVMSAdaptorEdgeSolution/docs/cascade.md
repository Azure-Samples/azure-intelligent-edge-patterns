# Cascade Openvino Face Detection with Classification Models

To cascade object detection with classification, we need a more complicated graph. We're here using openvino model zoo's face detection, emotion recognition, gender/age recognition as example here.

![arch_img](../../assets/Cascade2_%20custom%20node_20210927.png?raw=true)


Since the output for the detection model is the position/confidence of the bounding boxes but not the image for the face, we need to crop the faces and then forward them to classification models. To do so, we add a new `crop` node that need not only the result from the detection model but also the original source image

    {
            "node_id": "3_13",
            "name": "crop",
            "type": "openvino_library",
            "inputs": [
                {
                    "name": "image",
                    "metadata": {
                        "type": "image",
                        "shape": [
                            1,
                            3,
                            416,
                            416
                        ],
                        "layout": [
                            "N",
                            "H",
                            "W",
                            "C"
                        ],
                        "color_format": "BGR"
                    }
                },
                {
                    "name": "detection",
                    "metadata": {
                        "type": "bounding_box",
                        "shape": [
                            1,
                            1,
                            200,
                            7
                        ],
                        "layout": [
                            1,
                            1,
                            "B",
                            "F"
                        ]
                    }
                }
            ],
            "outputs": [
                {
                    "name": "images",
                    "metadata": {
                        "type": "image",
                        "shape": [
                            -1,
                            1,
                            3,
                            64,
                            64
                        ],
                        "layout": [
                            "B",
                            "N",
                            "H",
                            "W",
                            "C"
                        ],
                        "color_format": "BGR"
                    }
                },
                {
                    "name": "coordinates",
                    "metadata": {
                        "type": "bounding_box",
                        "shape": [
                            -1,
                            1,
                            1,
                            200,
                            7
                        ],
                        "layout": [
                            "B",
                            1,
                            1,
                            "B",
                            "F"
                        ]
                    }
                },
                {
                    "name": "confidences",
                    "metadata": {
                        "type": "regression",
                        "shape": [
                            -1,
                            1,
                            1,
                            1,
                            1
                        ],
                        "layout": [
                            "B",
                            1,
                            1,
                            "B",
                            "F"
                        ]
                    }
                }
            ],
            "openvino_model_name": "",
            "openvino_library_name": "libcustom_node_model_zoo_intel_object_detection.so",
            "download_uri_openvino": "",
            "params": {
                "original_image_width": "416",
                "original_image_height": "416",
                "target_image_width": "64",
                "target_image_height": "64",
                "original_image_layout": "NHWC",
                "target_image_layout": "NHWC",
                "convert_to_gray_scale": "false",
                "max_output_batch": "100",
                "confidence_threshold": "0.7",
                "debug": "true",
                "filter_label_id": "-1"
            },
            "combined": ""
        }
	
We've already built-in this custom library ```libcustom_node_model_zoo_intel_object_detection```, for more details about the parameters, please check [here](https://github.com/openvinotoolkit/model_server/tree/main/src/custom_nodes/model_zoo_intel_object_detection)

After adding the ```crop``` node, we now can forward the cropped images to the age/gender classification model node

    {
            "node_id": "7_12",
            "name": "age_gender_recognition",
            "type": "openvino_model",
            "inputs": [
                {
                    "name": "data",
                    "metadata": {
                        "type": "image",
                        "shape": [
                            1,
                            3,
                            64,
                            64
                        ],
                        "layout": [
                            "N",
                            "H",
                            "W",
                            "C"
                        ]
                    }
                }
            ],
            "outputs": [
                {
                    "name": "age_conv3",
                    "metadata": {
                        "type": "regression",
                        "shape": [
                            1,
                            1,
                            1,
                            1
                        ],
                        "layout": [
                            1,
                            1,
                            1,
                            1
                        ],
                        "scale": 100
                    }
                },
                {
                    "name": "prob",
                    "metadata": {
                        "type": "classfication",
                        "shape": [
                            1,
                            2,
                            1,
                            1
                        ],
                        "layout": [
                            1,
                            "P",
                            1,
                            1
                        ],
                        "labels": [
                            "female",
                            "male"
                        ]
                    }
                }
            ],
            "openvino_model_name": "age-gender-recognition-retail-0013",
            "openvino_library_name": "",
            "download_uri_openvino": "",
            "params": "",
            "combined": ""
        },

Similarly we can add emotion recognition model as well

    {
            "node_id": "6_11",
            "name": "emotion_recognition",
            "type": "openvino_model",
            "inputs": [
                {
                    "name": "data",
                    "metadata": {
                        "type": "image",
                        "shape": [
                            1,
                            3,
                            64,
                            64
                        ],
                        "layout": [
                            "N",
                            "H",
                            "W",
                            "C"
                        ]
                    }
                }
            ],
            "outputs": [
                {
                    "name": "prob_emotion",
                    "metadata": {
                        "type": "classification",
                        "shape": [
                            1,
                            5,
                            1,
                            1
                        ],
                        "layout": [
                            1,
                            "C",
                            1,
                            1
                        ],
                        "labels": [
                            "neutral",
                            "happy",
                            "sad",
                            "surprise",
                            "anger"
                        ]
                    }
                }
            ],
            "openvino_model_name": "emotions-recognition-retail-0003",
            "openvino_library_name": "",
            "download_uri_openvino": "",
            "params": "",
            "combined": ""
        }
	
Afterall, we need to use edges to connect all the needed input/output pairs, the full example is [here](voe_config.json)




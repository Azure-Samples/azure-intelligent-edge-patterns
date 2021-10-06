# Custom Vision Object Detection

![arch_img](../assets/Cascade3_cv%20model_20210927.png?raw=true)

Here we assume you've already finished the tutorial from the [OpenVino Face Detection](openvino_face_detection.md)

To build the video pipeline with customvision's object detection model, you need to use the type `customvision_model` instead of `openvino_model`


    {   
            "node_id": "1_10",
            "name": "coco_train",
            "type": "customvision_model",
            "inputs": [
                {   
                    "name": "data",
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
                }
            ],
            "outputs": [
                {   
                    "name": "detection_out",
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
                        ],
                        "labels": [
                            "person"
                        ]
                    }
                }
            ],
            "openvino_model_name": "",
            "openvino_library_name": "",
            "download_uri_openvino": "https://irisscuprodstore.blob.core.windows.net:443/m-dc404180301e4aa3aafee8bdeb198ddc/6eea592ce70f42bebe13a6914391b459.OpenVino.zip?sv=2019-12-12&se=2021-08-27T10%3A20%3A38Z&sr=b&sp=r&sig=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx%3D",
            "params": "",
            "combined": ""
        },

Note that the you need to export the model on customvision with the openvino format, and the paste the link in the ```download_uri_openvino``` field; learn more from [here](../Tutorial/export_cv_model.md)

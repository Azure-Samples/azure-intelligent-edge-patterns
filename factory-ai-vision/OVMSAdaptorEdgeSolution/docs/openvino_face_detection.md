# OpenVino Face Detection

The following is a simple case that only use the model from openvino model zoo to do the face detection

![arch_img](../../assets/Cascade1_ovms%20model_20210927.png?raw=true)


We need 2 nodes to for this case
A source node the represent the image source with some metadata like shape or color format

    {
            "node_id": "0_9",
            "name": "request",
            "type": "source",
            "inputs": [],
            "outputs": [
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
                }
            ],
            "openvino_model_name": "",
            "openvino_library_name": "",
            "download_uri_openvino": "",
            "params": "",
            "combined": ""
    }

A openvino model node to do the face detection

    {
            "node_id": "1_10",
            "name": "face_detection",
            "type": "openvino_model",
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
                            "face"
                        ]
                    }
                }
            ],
            "openvino_model_name": "face-detection-retail-0004",
            "openvino_library_name": "",
            "download_uri_openvino": "",
            "params": "",
            "combined": ""
        }

Note that the `openvino_model_name` need to be the same as the one on openvino intel pretrain model website, for our sample, it's [face-detection-retail-0004](https://docs.openvinotoolkit.org/latest/omz_models_model_face_detection_retail_0004.html)
   
To cascade the result from the image source to the face detection model, we need to add an directed edge to connect them

    {
            "source": {
                "node_id": "0_9",
                "output_name": "image"
            },
            "target": {
                "node_id": "1_10",
                "input_name": "data"
            }
    }
    
Note that each node might more multiple inputs/outputs, for each pair we need to create a edge to connect them

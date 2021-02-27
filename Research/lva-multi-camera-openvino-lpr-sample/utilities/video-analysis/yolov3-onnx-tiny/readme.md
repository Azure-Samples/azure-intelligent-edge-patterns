# Tiny Yolov3 ONNX model

The following instruction will enable you to build a docker container with [Tiny Yolov3](https://github.com/onnx/models/tree/master/vision/object_detection_segmentation/tiny-yolov3) [ONNX](http://onnx.ai/) model using [nginx](https://www.nginx.com/), [gunicorn](https://gunicorn.org/), [flask](https://github.com/pallets/flask), and [runit](http://smarden.org/runit/).

Note: References to third-party software in this repo are for informational and convenience purposes only. Microsoft does not endorse nor provide rights for the third-party software. For more information on third-party software please see the links provided above.

## Prerequisites
1. [Install Docker](http://docs.docker.com/docker-for-windows/install/) on your machine
2. Install [curl](http://curl.haxx.se/)

## Building the docker container

1. Create a new directory on your machine and copy all the files (including the sub-folders) from this GitHub folder to that directory.
2. Build the container image (should take some minutes) by running the following docker command from a command window in that directory

```bash
docker build . -t yolov3-onnx-tiny:latest
```
    
## Running and testing
REST endpoint accepts image with the size of 416 pixels by 416 pixels. This is requirement by YoloV3 model. Since LVA edge module is capable of sending specified size image in specified format, we are not preprocessing the incoming images for resize them. This is mainly because performance improvement.

Run the container using the following docker command

```bash
docker run  --name my_yolo_container -p 80:80 -d  -i yolov3-onnx-tiny:latest
```

Test the container using the following commands

### /score
To get a list of detected objected using the following command

```bash
curl -X POST http://127.0.0.1/score -H "Content-Type: image/jpeg" --data-binary @<image_file_in_jpeg>
```
If successful, you will see JSON printed on your screen that looks something like this
```json
{
    "inferences": [                
        {
            "entity": {
                "box": {
                    "h": 0.3498992351271351,
                    "l": 0.027884870008988812,
                    "t": 0.6497463818662655,
                    "w": 0.212033897746693
                },
                "tag": {
                    "confidence": 0.9857677221298218,
                    "value": "person"
                }
            },
            "type": "entity"
        },
        {
            "entity": {
                "box": {
                    "h": 0.3593513820482337,
                    "l": 0.6868949751420454,
                    "t": 0.6334065123374417,
                    "w": 0.26539528586647726
                },
                "tag": {
                    "confidence": 0.9851594567298889,
                    "value": "person"
                }
            },
            "type": "entity"
        }
    ]
}
```

Terminate the container using the following docker commands

```bash
docker stop my_yolo_container
docker rm my_yolo_container
```

## Upload docker image to Azure container registry

Follow instruction in [Push and Pull Docker images  - Azure Container Registry](http://docs.microsoft.com/en-us/azure/container-registry/container-registry-get-started-docker-cli) to save your image for later use on another machine.

## Deploy as an Azure IoT Edge module

Follow instruction in [Deploy module from Azure portal](https://docs.microsoft.com/en-us/azure/iot-edge/how-to-deploy-modules-portal) to deploy the container image as an IoT Edge module (use the IoT Edge module option). 


# IoT Edge samples

This folder contains IoT Edge deployment manifest templates and sample IoT Edge modules, as well as the setup resources.

## Deployment manifest templates

### deployment.yolov3.template.json

In addition to the modules defined in deployment.template.json, this deployment manifest template includes the [yolov3 module](https://github.com/Azure/live-video-analytics/tree/master/utilities/video-analysis/yolov3-onnx). This is an IoT Edge module that runs the YoloV3 ONNX model behind an HTTP endpoint.

### deployment.objectCounter.template.json

In addition to the modules defined in deployment.yolov3.template.json, this deployment manifest template includes the sample objectCounter module (source code for which can be found in ./modules/objectCounter). This template also has message routes defined to send messages from the lvaEdge module to the objectCounter module and vice versa, to enable the scenario of recording video clips when objects of a specified type (at a confidence measure above a specified threshold value) are found. See [this](https://docs.microsoft.com/azure/media-services/live-video-analytics-edge/event-based-video-recording-tutorial) tutorial on using this template.

### objectCounter

The folder **./modules/objectCounter** contains source code for an IoT Edge module that counts objects of a specified type and with a confidence above a specified threshold value (these are specified as twin properties in deployment.objectCounter.template.json). The module expects messages emitted by yolov3 module (referenced above).

## Learn more

* [Develop IoT Edge modules](https://docs.microsoft.com/en-us/azure/iot-edge/tutorial-develop-for-linux)

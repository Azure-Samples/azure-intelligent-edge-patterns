### Live Video Analytics Web Module

This application provides a UI for running Live Video Analytics. It is written with the intent of use on the Azure Stack Edge
Languages:
* JavaScript
* Node.js

Relies on npm modules:
* @azure/event-hubs
* @azure/eventhubs-checkpointstore-blob
* @azure/storage-blob
* azure-iot-device
* azure-iot-device-amqp
* azure-iothub
* body-parser
* bootstrap
* buffer
* express
* jquery
* nodemon
* ws (WebSocket)
* xmlhttprequest

This application is easily containerized and run as a module on the Azure Stack Edge. In a terminal navigate to your clone of this repo, and run
```
Docker build -t <your container registry>/folder -f Dockerfile .
```

Then tag and push. Add the following to your deployment manifest, making sure to provide your registry credentials at the top:

```
          "WebModule": {
            "version": "1.0",
            "type": "docker",
            "status": "running",
            "restartPolicy": "always",
            "settings": {
              "image": "your docker image here",
              "createOptions": "{\"HostConfig\":{\"PortBindings\":{\"5000/tcp\":[{\"HostPort\":5000}]}}}"
            }
          }
```

Deploy, then access your device IP:5000 to start using!
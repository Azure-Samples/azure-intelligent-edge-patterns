# Live Video Analytics Web Module #

This application provides a UI for running Live Video Analytics. It is written with the intent of use on the Azure Stack Edge
Languages:
* JavaScript
* Node.js

Relies on npm modules:
* @azure/event-hubs
* azure-iothub
* body-parser
* bootstrap
* buffer
* express
* jquery
* nodemon
* ws (WebSocket)
* xmlhttprequest

## How to set up Live Video Analytics ##
You can find a full tutorial [here](https://github.com/julialieberman/azure-intelligent-edge-patterns/blob/t-jull-lvasample/Research/lva-ase-sample/README.md) to help you set up your Azure Stack Edge, deploy modules, and start using Live Video Analytics.


## To run locally ##
* Clone this repository and open in VS Code - navigate to the lva-node-app directory in a terminal
* Make sure you have node and npm
* In the terminal, run the following two lines:
```
npm i
node .\app.js
```
* Open a browser and go to the url http://localhost:5000
* Have fun!

For debugging purposes you can create a standard Node.js debugger configuration in VS Code, or run 
```
nodemon .\app.js
```

## To run in a container ##
This application is easily containerized and run as a module on the Azure Stack Edge. In a terminal navigate to your clone of this repo, and run
```
docker build -t samplecontainerregistry.azurecr.io/folder -f Dockerfile .
```
Make sure you're logged into docker (docker login samplecontainerregistryname.azurecr.io)
See your current images by running 'docker images' in the terminal

Grab your recently created docker image ID and give it a tag, and then push it to your container registry! 
```
docker tag image_ID samplecontainerregistry.azurecr.io/folder:tag
docker push samplecontainerregistry.azurecr.io/folder:tag
```

## To deploy as a module on the Azure Stack Edge ##
Add the following to your deployment manifest, making sure to provide your registry credentials at the top:

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
See the bottom of this README for a full sample deployment.template.json 

## Connect to your IoT Hub in VS Code ##

Make sure you have the Azure IoT Tools [extension](https://marketplace.visualstudio.com/items?itemName=vsciot-vscode.azure-iot-tools)
	1. In Visual Studio Code, select View > Explorer. Or select Ctrl+Shift+E.
	2. In the lower-left corner of the Explorer tab, select Azure IoT Hub.
	3. Select the More Options icon to see the context menu. Then select Set IoT Hub Connection String.

When an input box appears, enter your IoT Hub connection string. Copy and paste the "IoThubConnectionString" value from the appsettings.json file you just made in the cloud shell. Alternatively, in the Azure Portal you can find this under your IoT Hub -> Settings -> Shared access policies -> iothubowner -> connection string – primary key.

If the connection succeeds, the list of edge devices appears. You should see at least one device with the name of your ASE. You can now manage your IoT Edge devices and interact with Azure IoT Hub through the context menu. To view the modules deployed on the edge device, under your device, expand the Modules node.

#### Monitor your IoT Hub in VS Code ####
Right click on your edge device and select "Start Monitoring Built-in Event Endpoint".

## How to deploy from VS Code

Make sure you have a .env file with all of your required values, unless you plan to manually enter them into your deployment.json. If you ran the setup script following [this](https://github.com/julialieberman/azure-intelligent-edge-patterns/blob/t-jull-lvasample/Research/lva-ase-sample/README.md) tutorial, a .env file was created for you - you can copy and paste the contents into a new .env file in your VS Code working directory.

* Right click on your deployment.template.json (sample provided below) and select “Generate Iot Edge deployment manifest”. This will create an IoT Edge deployment manifest file in a folder named config in your working directory, named deployment.amd64.json.
* Right click on config/deployment.amd64.json and select "Create Deployment for single device" and select the name of your edge device. This will trigger the deployment of the IoT Edge modules to your Edge device. You can view the status of the deployment in the Azure IoT Hub extension.

Deploy, then access your localhost:5000 in a browser to start using!


## Sample deployment.template.json ##
You could create a file in VS Code called deployment.template.json and paste the following in to use as your deployment template

```
{
  "modulesContent": {
    "$edgeAgent": {
      "properties.desired": {
        "schemaVersion": "1.0",
        "runtime": {
          "type": "docker",
          "settings": {
            "minDockerVersion": "v1.25",
            "loggingOptions": "",
            "registryCredentials": "{\"$CONTAINER_REGISTRY_USERNAME_myacr\":{\"username\":\"$CONTAINER_REGISTRY_USERNAME_myacr\",\"password\": \"$CONTAINER_REGISTRY_PASSWORD_myacr\",\"address\": \"$CONTAINER_REGISTRY_USERNAME_myacr.azurecr.io\"}}"
          }
        },
        "systemModules": {
          "edgeAgent": {
            "type": "docker",
            "settings": {
              "image": "mcr.microsoft.com/azureiotedge-agent:1.0",
              "createOptions": {}
            }
          },
          "edgeHub": {
            "type": "docker",
            "status": "running",
            "restartPolicy": "always",
            "settings": {
              "image": "mcr.microsoft.com/azureiotedge-hub:1.0",
              "createOptions": "{\"HostConfig\":{\"PortBindings\":{\"5671/tcp\":[{\"HostPort\":\"5671\"}],\"8883/tcp\":[{\"HostPort\":\"8883\"}],\"443/tcp\":[{\"HostPort\":\"443\"}]}}}"
            }
          }
        },
        "modules": {
          "lvaEdge": {
            "version": "1.0",
            "type": "docker",
            "status": "running",
            "restartPolicy": "always",
            "settings": {
              "image": "mcr.microsoft.com/media/live-video-analytics:1",
              "createOptions": "{\"HostConfig\":{\"LogConfig\":{\"Type\":\"\",\"Config\":{\"max-size\":\"10m\",\"max-file\":\"10\"}},\"Mounts\":[{\"Target\":\"/var/media\",\"Source\":\"$OUTPUT_VIDEO_FOLDER_ON_DEVICE\",\"Type\":\"volume\"},{\"Target\":\"/var/lib/azuremediaservices\",\"Source\":\"$APPDATA_FOLDER_ON_DEVICE\",\"Type\":\"volume\"}]}}"
            }
          },
          "rtspsim": {
            "version": "1.0",
            "type": "docker",
            "status": "running",
            "restartPolicy": "always",
            "settings": {
              "image": "mcr.microsoft.com/lva-utilities/rtspsim-live555:1.2",
              "createOptions": "{\"HostConfig\":{\"Mounts\":[{\"Source\":\"$INPUT_VIDEO_FOLDER_ON_DEVICE\",\"Target\":\"/live/mediaServer/media\",\"Type\":\"volume\"}],\"PortBindings\":{\"554/tcp\":[{\"HostPort\":\"554\"}]}}}"
            }
          },
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
        }
      }
    },
    "$edgeHub": {
      "properties.desired": {
        "schemaVersion": "1.0",
        "routes": {
          "LVAToHub": "FROM /messages/modules/lvaEdge/outputs/* INTO $upstream"
        },
        "storeAndForwardConfiguration": {
          "timeToLiveSecs": 7200
        }
      }
    },
    "lvaEdge": {
        "properties.desired": {
          "applicationDataDirectory": "/var/lib/azuremediaservices",
          "azureMediaServicesArmId": "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/microsoft.media/mediaservices/$AMS_ACCOUNT",
          "aadTenantId": "$AAD_TENANT_ID",
          "aadServicePrincipalAppId": "$AAD_SERVICE_PRINCIPAL_ID",
          "aadServicePrincipalSecret": "$AAD_SERVICE_PRINCIPAL_SECRET",
          "aadEndpoint": "https://login.microsoftonline.com",
          "aadResourceId": "https://management.core.windows.net/",
          "armEndpoint": "https://management.azure.com/",
          "diagnosticsEventsOutputName": "AmsDiagnostics",
          "operationalEventsOutputName": "AmsOperational",
          "logLevel": "Verbose",
          "logCategories": "Application,Events",
          "allowUnsecuredEndpoints": true,
          "telemetryOptOut": false
        }
    }
  }
}
```
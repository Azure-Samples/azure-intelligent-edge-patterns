## STEP 3: SET UP VS CODE AND DEPLOY AND RUN SAMPLE ##

Live Video Analytics cloud to device sample console app

This directory contains a dotnet core sample app that would enable you to invoke direct methods exposed by the Live Video Analytics on IoT Edge module. A JSON file (operations.json) defines the sequence of those direct methods, and the parameters for the calls.

## Contents

| File/folder             | Description                                                   |
|-------------------------|---------------------------------------------------------------|
| `c2d-console-app.csproj`| Project file.                                                 |
| `.gitignore`            | Defines what to ignore at commit time.                        |
| `README.md`             | This README file.                                             |
| `operations.json`       | JSON file defining the sequence of direct methods to invoke.  |
| `Program.cs`            | The main program file                                         |
| `httpwithmotiontopology.json`            | The media graph topology to push output video to the cloud                                         |
| `httpwithmotiontopology.json`            | The media graph topology to push output video to your local share                                         |


## Setup instructions

### Prerequisites

* You should have followed the instructions in the main [Readme](https://github.com/julialieberman/azure-intelligent-edge-patterns/blob/t-jull-lvasample/Research/lva-ase-sample/README.md)
* You then should have followed the instructions in the setup [Readme](https://github.com/julialieberman/azure-intelligent-edge-patterns/blob/t-jull-lvasample/Research/lva-ase-sample/src/edge/setup/readme.md)
* Now you should have the following resources in your resource group
	* ASE device linked to your IoT Hub
	* IoT Hub
	* Storage account
	* Azure Media Services
	* Streaming endpoint
	* Container Registry

## Connect to your IoTHub:
	1. In Visual Studio Code, select View > Explorer. Or select Ctrl+Shift+E
	2. In the lower-left corner of the Explorer tab, select __Azure IoT Hub__
	3. Select the More Options icon to see the context menu (the ...). Then select Set IoT Hub Connection String.
	4. When an input box appears, enter your IoT Hub connection string. Copy and paste the "IoThubConnectionString" value from the appsettings.json file you just made in the cloud shell. Alternatively, in the Azure Portal you can find this under your IoT Hub / Settings / Shared access policies / iothubowner / connection string – primary key.

If the connection succeeds, the list of edge devices appears. You should see your ASE. You can now manage your IoT Edge devices and interact with Azure IoT Hub through the context menu. To view the modules deployed on the edge device, under your device, expand the Modules node.

## Running the sample

Detailed instructions for running the sample can be found in the quickstarts (such as [this](https://docs.microsoft.com/azure/media-services/live-video-analytics-edge/detect-motion-emit-events-quickstart) one) and tutorials for Live Video Analytics on IoT Edge. Below is a summary of the key steps.
For our purposes, we will be using the topology file called 'httpwithmotiontopologylocal.json' which is already pointed to by your operations.json file. 

* Right click on src/edge/deployment.yolov3.template.json and select **“Generate Iot Edge deployment manifest”**. This will create an IoT Edge deployment manifest file in src/edge/config folder named deployment.yolov3.amd64.json.
* Right click on src/edge/config/deployment.yolov3.amd64.json and select **"Create Deployment for single device"** and select the name of your edge device. This will trigger the deployment of the IoT Edge modules to your Edge device. You can view the status of the deployment in the Azure IoT Hub extension (expand 'Devices' and then 'Modules' under your IoT Edge device).
* Right click on your edge device in Azure IoT Hub extension and select **"Start Monitoring Built-in Event Endpoint"**.
* Start a debugging session (hit F5). You will start seeing some messages printed in the TERMINAL window. In the OUTPUT window, you will see messages that are being sent to the IoT Hub by the Live Video Analytics on IoT Edge module. It will prompt you to hit enter a few times, but wait after you see "The topology will now be deactivated" if you want to let the module run for a few minutes.

You can see the sample recordings updating in your local share from your file explorer. Go ahead and hit enter in the terminal when prompted until the program ends. 

Congratulations, you now have LVA running on the ASE!

## Next steps
You may change from using local shares to running this in the cloud. Do this by modifying your operations.json file in the following ways
* Change the topologyFile from ".\\httpwithmotiontopologylocal.json" to ".\\httpwithmotiontopology.json"
* Change all instances of "EVROnMotionExtensionLocal" to "EVROnMotionPlusHttpExtension"
* Make sure your input/output folders point to valid cloud compute enabled shares from your .env file
When running, if you want to visualize the video, navigate in your Azure Portal to your media services account and click on the assets view ![image](https://github.com/julialieberman/azure-intelligent-edge-patterns/blob/t-jull-lvasample/Research/lva-ase-sample/src/edge/setup/assets/viewassets.PNG)

Note that the program will need to run long enough for the video to come through
* Click on the oldest asset from your current session
* Scroll down and you'll see Streaming URL: None. Click on Create new underneath it
* Click on add (leave the settings as they are) and wait a minute or two and you should be able to see the video stream!

Experiment with different [graph topologies](https://docs.microsoft.com/azure/media-services/live-video-analytics-edge/media-graph-concept#media-graph-topologies-and-instances) by modifying operations.json.

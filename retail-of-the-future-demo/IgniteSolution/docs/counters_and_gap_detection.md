<!-- TOC -->

- [Calibrating Counters](#calibrating-counters)
  - [Setting up Counters with RTSP URI and Direction](#setting-up-counters-with-rtsp-uri-and-direction)
  - [CountingAgg Setup](#countingagg-setup)
- [Gap Detection](#gap-detection)
  - [Setup Monitoring App](#setup-monitoring-app)
  - [Modules](#modules)
  - [inventorycam Setup](#inventorycam-setup)
  - [Tips for inventorycam Calibration](#tips-for-inventorycam-calibration)
  - [Gap Detection On-the-fly Modifications](#gap-detection-on-the-fly-modifications)
  - [Twin Module Properties](#twin-module-properties)
    - [Camera Module](#camera-module)
    - [Video Processing Module](#video-processing-module)
  - [Troubleshooting](#troubleshooting)
    - [Gap Detection](#gap-detection-1)
    - [Containers](#containers)
    - [Configuring PowerShell (from the above doc)](#configuring-powershell-from-the-above-doc)
    - [Pulling Fresh Images](#pulling-fresh-images)

<!-- /TOC -->
# Calibrating Counters

Each counter is represented by a separate container that processes images from a single camera. All counters message an aggregator which exposes a simple REST API that allows a front end to receive final counts:

![](images/counterarch.png)

## Setting up Counters with RTSP URI and Direction

Configure camera streams to run. Below is an example, for **Amcrest HD cameras only**:
* set it to stream at 15 fps (a higher value appears to introduce a significant lag)
* note camera IP. The RTSP URL is of the form: `rtsp://<user>:<password>@<ip>:554/cam/realmonitor?channel=1?subtype=0`. For example: `rtsp://admin:IgniteDemo2019@192.168.0.222:554/cam/realmonitor?channel=1?subtype=0`.
**NOTE**: The `subtype` argument is preceded by a "?" instead of an "&". This is due to the URI being passed as a command line argument which requires an "&" to be escaped. This is easy to forget and leads to unpleasant consequences. "?" works just fine.

Configure the counter by first running it from the command line (assuming root of the repo as the current directory):

```sh
cd IgniteSolution\modules\Counting\people-counting
python people_counter.py -i <camera_rtsp_url> -s 15 --visual --direction <left, right, up, down> --id 1
```

E.g.: to run on an example video file:

```sh
python people_counter.py -i videos\example_01.mp4 --direction up -s 15 --visual --id 1
```

![](images/count_video.png)

This will instantiate a counter that trips when a person crosses the mid-line "up". The "in" area is marked tinted in red.

Once a counter is setup with the URI and direction, modify the corresponding `Cmd` line in `deployment.remote.template.json`. Counters are named `CountingN`, where N: [1, 3] For example, here is the block describing `Counter1`:
```json
"Counting1": {
  "version": "1.0",
  "type": "docker",
  "status": "running",
  "restartPolicy": "always",
  "settings": {
    "image": "$CONTAINER_REGISTRY_LOGIN_SERVER/ignite/counting",
    "createOptions": {
      "Cmd": [
        "./people-counting/exec_count.sh people_counter.py -i rtsp://admin:IgniteDemo2019@192.168.0.222:554/cam/realmonitor?channel=1?subtype=0 --direction left -s 15 --id cam1 --set-count"
      ],
      "ExposedPorts": {
        "5680/tcp": {}
      },
      "HostConfig": {
        "PortBindings": {
          "5680/tcp": [
            {
              "HostPort": "5680"
            }
          ]
        }
      }
    }
  }
},
```
For each of the counters, modify the RTSP URI and direction parameters, and redeploy.

**NOTE**: One and only one of the counters must have the `--set-count` argument passed to it in its command line. This parameter indicates which of the counters will receive the reset value when it is requested through the UX (e.g., when reset to 5, the counter with `--set-count` will restart counting from 5 all other counters will restart from 0).

For a full list of parameters, consult `parse_counter_args()` defined in [cmd_args.py](../modules/Counting/people-counting/cmdline/cmd_args.py)

After the setup follow the steps in the [README](../README.md) to re-deploy to the edge.

## CountingAgg Setup

The aggregation and REST API server container should not require any additional setup/customization. Its command line parameters are described in the same [cmd_args.py](../modules/Counting/people-counting/cmdline/cmd_args.py) file if additional customization is required. It is listening for requests on port 5001.

# Gap Detection

## Setup Monitoring App

Recommended: Setup the monitoring app by going through the steps under [AI Video Intelligence Solution Accelerator](https://github.com/Azure-Samples/AI-Video-Intelligence-Solution-Accelerator#ai-video-intelligence-solution-accelerator) up to and not including `AI Video Edge Device Deployment`.

**Important**: If the application is deployed it will create an IoT Hub of its on. The ASE used for the demo will then need to point at that IoT Hub.

## Modules

There are several modules involved in shelf gap detection:

* `CameraModule` - aggregates images from different cameras and sends them to `VideoProcessorModule` for detection
* `VideoProcessorModule` - collects images from `CameraModule` and invokes different detection mechanisms.
* `grocerymodel` - detection model running on CPU
* `voiddetectionbrainwave` - detection model running on FPGA
* `inventorycam` - HTTP server that provides frames to `CameraModule`

## inventorycam Setup

This module streams images from the gap detection camera via RTSP and sends them to the `CameraModule` when requested. The `Cmd` parameter in this module deployment configuration requires only one argument to be modified: the RTSP URI of the gap detection camera, e.g.: `./camera-stream/run_camera.sh camera.py rtsp://admin:IgniteDemo2019@192.168.0.223/cam/realmonitor?channel=1?subtype=1`

This camera should be calibrated post-deployment:
1. Deploy all containers
1. Launch ASE
1. Using VLC player, stream video from the camera, checking the efficacy of detection in the [monitoring app](https://github.com/Azure-Samples/AI-Video-Intelligence-Solution-Accelerator#ai-video-intelligence-solution-accelerator).

## Tips for inventorycam Calibration

1. Make sure there is enough light
1. The shelves and their backgrounds need to be white
1. Make sure the desired gap is:
    * rectangular
    * has enough non-shadowed white space (shadows may fall from items on each side of the gap)

## Gap Detection On-the-fly Modifications

Gap detection containers are deployed with "module twin" funcitionality which is an Azure IoT way of saying that they some properties may be changed while the container is running.

Module twin properties may be modified through Azure portal:
1. Select IoT Hub resource
1. In the left pane select `IoT Edge`
1. Select the device
1. Select a module, e.g.: `VideoProcessorModule`
1. In the top left corner of the Module Details page select `Module Identity Twin`

![](images/twin.png)

Once you modify any of the desired properties (technical term in this case), don't forget to hit "Save":

![](images/save_props.png)

## Twin Module Properties

### Camera Module

There is a single `cameras` property which describes a collection of cameras streaming into the module:
```json
    "desired": {
      "schemaVersion": "1.0",
      "cameras": {
        "cam001": {
          "port": "counter",
          "id": "fixed_image",
          "type": "simulator",
          "secondsBetweenImages": 10,
          "disabled": false
        },
        "cam002": {
          "port": "cycle-0",
          "id": "cycle_images",
          "type": "simulator",
          "secondsBetweenImages": 10,
          "disabled": false
        },
        "cam003": {
          "port": "http://inventorycam:50011/image/700",
          "id": "gap_images_camera_2",
          "type": "http",
          "secondsBetweenImages": 1,
          "skipMLProcessing": false,
          "disabled": false
        }
      },
```
In the above snippet, `cam001` and `cam002` point at sample stock images which can be observed in our [monitoring app](https://igniteshelf.azurewebsites.net/dashboard):

![](images/fixed_cam.png)

Notice the text in the dropdown. It corresponds to the `id` parameter of the camera property. This id in turn is the name of a blob "subdirectory" where images for this camera are uploaded and where the UX as well as the monitoring app retrieve it from. So if modified here the same modification needs to be applied to the UX.

In our configuration, `cam003` is the one streaming real images. This camera needs to be configured before deployment as described in the [README](../README.md).

![](images/blob.png)

### Video Processing Module

The only property we may need to change is `mlModelType`:

```json
"desired": {
  "schemaVersion": "1.0",
  "blobStorageSasUrl": "BlobEndpoint=https://storage235un.blob.core.windows.net/;QueueEndpoint=https://storage235un.queue.core.windows.net/;FileEndpoint=https://storage235un.file.core.windows.net/;TableEndpoint=https://storage235un.table.core.windows.net/;SharedAccessSignature=sv=2018-03-28&ss=b&srt=co&sp=wc&se=2020-01-01T03:45:03Z&st=2019-10-10T18:45:03Z&spr=https&sig=utrXwqq8nObOkLuCWnUyR%2FpI0othH3rxX3uGwYEsOwk%3D",
  "mlModelType": "CPU",
  "FPGA": {
    "rgbRefLevel": "104, 117, 123"
  },
```
The `mlModelType` property may be set to either `FPGA` or `CPU`. Recommend setting it to `CPU`, which appears to invoke a more sensitive model that is much easier to calibrate.

## Troubleshooting 

Once ASE is started it may take 5-10 min for all containers to come on line. Since some containers depend on others being up while the order they are brought up is random some containers may come up and shut down immediately. IoT Agent will keep restarting them until everything stabilizes, so be patient.

### Gap Detection

The modules described above may become unstable and stop streaming. 
Try shutting down (`dkrdbe stop`) `VideoProcessorModule` and `CameraModule`. It is possible to ascertain from the logs (`dkrdbe logs --tail 20 <container>`) if both have stopped transmitting. Most likely it will just be the `VideoProcessorModule`.

If this fails - soft-restart the ASE.

### Containers

ASE does not allow much control. It is possible to use remote PowerShell to connect to it and look into the logs. Follow the instructions in the [Manage an Azure Data Box Edge device via Windows PowerShell](https://docs.microsoft.com/en-us/azure/databox-online/data-box-edge-connect-powershell-interface) to connect to ASE remote PS to get a subset of `docker` commands aliased as `dkrdbe`

### Configuring PowerShell (from the above doc)

1. Run a Windows PowerShell session as an administrator.
Make sure that the Windows Remote Management service is running on your client. At the command prompt, type:

```sh
winrm quickconfig
```

2. Assign a variable to the device IP address.

```sh
$ip = "<device_ip>"
```
Replace <device_ip> with the IP address of your device.

3. To add the IP address of your device to the client’s trusted hosts list, type the following command:
```sh
Set-Item WSMan:\localhost\Client\TrustedHosts $ip -Concatenate -Force
```

4. Start a Windows PowerShell session on the device:
```sh
Enter-PSSession -ComputerName $ip -Credential $ip\EdgeUser -ConfigurationName Minishell
```

From this point on, useful commands are:

* `dkrdbe ps` - to look at running containers
* `dkrdbe ps --no-trun` - look at the entire command lines with which containers have been launched
* `dkrdbe ps -a` - to see _all_ containers, running or not
* `dkrdbe logs --tail 100 <container_name>` - to see container logs
* `dkrdbe logs -f <containr_name>` - to attach to container logs.

Keep in mind, that instead of `container_name` it is enough to specify a part of its container id (sufficient for the agent to find the right container). Usually the first 2 and almost always the first 3 symbols of the container id will suffice.

![](images/containerid.png)

### Pulling Fresh Images

If any changes are made to images:

```sh
dkrdbe login -u myregistry -p <password> myregistry.azurecr.io
dkrdbe pull myregistry.azurecr.io/myimage
```    
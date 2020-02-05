# Calibrating Counters

Each counter is represented by a separate container that processes images from a single camera. All counters message an aggregator which exposes a simple REST API that allows a front end to receive final counts:

![](images/counterarch.png)

## Setting up Counters with RTSP URI and Direction

Configure camera streams to run:
* at 15 fps for Amcrest (a higher value appears to introduce a significant lag)
* note camera IP. The RTSP URL is of the form: `rtsp://<user>:<password>@<ip>:554/cam/realmonitor?channel=1?subtype=0`. For example: `rtsp://admin:IgniteDemo2019@192.168.0.222:554/cam/realmonitor?channel=1?subtype=0`.
**NOTE**: The `subtype` argument is preceded by a "?" instead of an "&". This is due to the URI being passed as a command line argument and the it is easy to forget to escape the "&" which leads to unpleasant consequences. "?" works just fine.


Configure the counter by first running it on the command line (assuming root of the repo as the pwd):

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

**NOTE**: One and only one of the counters must have the `--set-count` argument passed to it in its command line. This parameter regulates which of the counters will receive the reset value when the counter is reset (other counters will be reset to 0).

For a full list of parameters, consult `parse_counter_args()` defined in [cmd_args.py](../modules/CameraStream/camera-stream/cmdline/cmd_args.py)

After the setup follow the steps in the [README](../README.md) to re-deploy to the edge.

## CountingAgg Setup

The aggregation and REST API server container should not require any additional setup/customization. Its command line parameters are described in the same [cmd_args.py](../modules/CameraStream/camera-stream/cmdline/cmd_args.py) file if additional customization is required. It is listening for requests on port 5001.

## inventorycam Setup

This module streams images from the gap detection camera via RTSP and sends them to the `CameraModule` when requested. The `Cmd` parameter in this module deployment configuration requires only one argument to be modified: the RTSP URI of the gap detection camera, e.g.: `./camera-stream/run_camera.sh camera.py rtsp://admin:IgniteDemo2019@192.168.0.223/cam/realmonitor?channel=1?subtype=1`

This camera should be calibrated post-deployment:
1. Deploy all containers
1. Launch DBE
1. Using VLC player, stream video from the camera, checking the efficacy of detection in the [monitoring app](https://igniteshelf.azurewebsites.net/dashboard).

## Tips for inventorycam Calibration

1. Make sure there is enough light
1. The shelves and their backgrounds need to be white
1. Make sure the desired gap is:
    * rectangular
    * has enough non-shadowed white space (shadows may fall from items on each side of the gap)
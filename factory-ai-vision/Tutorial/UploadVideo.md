

# Quickstart: Upload your own video to be processed

If you don't have real camera devices to connect to your IoT Edge device, you can use the RTSP simulator that is already installed on your edge device after the [installation tutorial](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/Tutorial/Shell-installer-Tutorial.md). 

Upload your own video to your Azure IoT Edge device for further analysis in this quickstart by copying the video file to the RTSP simulator container on your IoT Edge VM and analyzing the RTSP stream it creates in Vision on Edge solution.
<br/><br/>

## Prerequisites

Before you start, you should complete the previous  [Deploy your first IoT Edge module to a virtual Linux device](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/Tutorial/CreateIoTEdgeDevice.md)  and  [Vision on Edge Shell Installer](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/Tutorial/Shell-installer-Tutorial.md)  tutorial.

You also need an Azure subscription. If you don't have an Azure subscription, you can create one for free on the  [Azure sign-up page](https://aka.ms/createazuresubscription).
<br/><br/>

## Upload the video to your edge device
To upload the video for further analysis, first you would have to upload the video file to your IoT Edge device through ***scp*** command:
```bash
scp <path to your video> <edge username>@<edge device IP>:.
```
For example:
Assume that you login your edge device as ***azureuser*** through ***0.0.0.0*** and the file to be uploaded is located in ***videos/test_video.mkv***.

Then after `scp video/test_video.mkv azureuser@0.0.0.0:.`, the video file would be copied to your edge device.
<br/><br/>

## Copy the video file to RTSP simulator
After the [shell installation tutorial](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/Tutorial/Shell-installer-Tutorial.md). There would be an RTSP simulator container installed on your edge device. You can first check whether the container exists by running the command below on your edge device:

```bash
sudo docker ps
```
![Diagram - Check RTSP simulator container](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/upload_video1.png)
Since the RTSP simulator would only host the video in the specific location in its container. So you would have to put your video file into the container of the RTSP simulator.

On your IoT Edge device, you can copy the video file you just upload into the RTSP simulator container through ***docker cp*** command:
```bash
sudo docker cp <path to your video on edge> rtspsim:/live/mediaServer/media/
```

The video would then be copied into the RTSP simulator container.
<br/><br/>



## Analyze the RTSP stream of your video
After uploading the video to RTSP simulator, you can now access the RTSP stream of your video through ***rtsp://rtspsim:554/media/<video_name>***.

In the previous example, the RTSP URL would be ***rtsp://rtspsim:554/media/test_video.mkv***

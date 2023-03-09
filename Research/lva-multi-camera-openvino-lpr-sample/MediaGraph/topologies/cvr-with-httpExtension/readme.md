# Continuous video recording and inferencing using HTTP Extension

This topology enables you to continuously record the video from an RTSP-capable camera to an Azure Media Services Asset. You can read more about the relevant settings in [this](https://github.com/Azure/live-video-analytics/blob/master/MediaGraph/topologies/cvr-asset/readme.md) page.

Additionally, this topology enables you to run video analytics on a live feed from an RTSP-capable camera, on a subset of the incoming video frames (as controlled by the frame rate filter processor node), by sending them to an external AI inference engine. The results are then published to the IoT Edge Hub.


<br>
<p align="center">
  <img src="./topology.png" title="Continuous video recording and inferencing using HTTP Extension"/>
</p>
<br>

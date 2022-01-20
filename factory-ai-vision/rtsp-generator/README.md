<h1 align="center">RTSP Endpoint with Gstreamer 👋</h1>
<p>
 How to generate RTSP endpoint with GStreamer.
</p>



## GStreamer Installation

```sh
sudo apt-get install libgstreamer1.0-0 gstreamer1.0-plugins-base gstreamer1.0-plugins-good gstreamer1.0-plugins-bad gstreamer1.0-plugins-ugly gstreamer1.0-libav gstreamer1.0-doc gstreamer1.0-tools
sudo apt-get install gstreamer1.0-plugins-base-apps
sudo apt-get install gir1.2-gst-rtsp-server-1.0
sudo apt-get install python-gst-1.0 python3-gst-1.0
sudo apt-get install python3-opencv

```

## Usage

```sh
Download gst-rtsp.py to current folder

Modify Line 14 for your own video or url 
> - self.cap = cv2.VideoCapture("your own video file or url ")
python3 gst-rtsp.py
```

## Author

👤 **Tommy Wu**

* Github: [@tommywu052](https://github.com/tommywu052)

## Thanks you

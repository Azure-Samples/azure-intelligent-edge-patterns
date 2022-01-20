# RUNNING FACTORY AI ON WSL2 with GPU Acceleration Enabled


1.  WSL2 Environment Setup :

    A.  Surface Book2 with GTX 1060

    B.  Windows Insider Preview Build 20150 or higher :  [register for
        the Windows Insider
        Program](https://insider.windows.com/getting-started/#register).

    C.  Download Nvidia Driver :
        <https://developer.nvidia.com/45541-gameready-win10-dch-64bit-international>

    D.   [Enable WSL
        2](https://docs.microsoft.com/en-us/windows/wsl/install-win10) and [install
        a glibc-based
        distribution](https://docs.microsoft.com/en-us/windows/wsl/install-win10#install-your-linux-distribution-of-choice) (like
        Ubuntu or Debian). I choose Ubuntu 18.04

    E.  Check this
        [guide](https://docs.nvidia.com/cuda/wsl-user-guide/index.html#setting-containers)
        to install Nvidia container. (Should install this before IoT
        Edge installation) .

2.  Install IoT Edge and Configure your device on IoT Hub by the
    [doc](https://docs.microsoft.com/en-us/azure/iot-edge/how-to-install-iot-edge-linux).

![](https://github.com/tommywu052/azure-intelligent-edge-patterns/blob/master/factory-ai-vision/wsl2/media/image3.png)

3.  Steps to run AI workload for Web Module & Inference Module --

    A.  Start the previous distro environment

> ![](https://github.com/tommywu052/azure-intelligent-edge-patterns/blob/master/factory-ai-vision/wsl2/media/image4.png)
    B.  Clone the
    [start.sh](https://github.com/tommywu052/azure-intelligent-edge-patterns/blob/master/factory-ai-vision/wsl2/start.sh)
    on the root folder.

    C.  cd \~ & ./start.sh

> ![](https://github.com/tommywu052/azure-intelligent-edge-patterns/blob/master/factory-ai-vision/wsl2/media/image5.png)

    D.  Check your module status :

> ![](https://github.com/tommywu052/azure-intelligent-edge-patterns/blob/master/factory-ai-vision/wsl2/media/image6.png)

    E.  nano the /etc/docker/daemon.json as

> ![](https://github.com/tommywu052/azure-intelligent-edge-patterns/blob/master/factory-ai-vision/wsl2/media/image7.png)

    F.  systemctl restart docker & iotedge restart

```{=html}
```
4.  Testing Process :

    A.  Check WebModule is running :

         iotedge logs -f WebModule \--tail 500

    B.  Go to <http://localhost:8181/>.

> ![](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/wsl2-3.png)

    C.  Go to Home, and click Scenario Library to choose your scenario; choose your camera and objects, and click Deploy.
    
> ![](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/wsl2-1.png)

    D.  Check the Right-hand side Insights about GPU(accelerated).


![](https://github.com/linkernetworks/azure-intelligent-edge-patterns/blob/develop/factory-ai-vision/assets/wsl2-2.png)

    E.  Verify the logs on inference module : some onnxruntime warning but
        initializer scalepreprocessor scale.

   > ![](https://github.com/tommywu052/azure-intelligent-edge-patterns/blob/master/factory-ai-vision/wsl2/media/image12.png)

    F.  Done and Enjoy your WSL2 !
